const express = require("express");
const http = require("http");
const path = require("path");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" },
});

const PORT = process.env.PORT || 3000;
const sessions = new Map();
const socketMeta = new Map();
const MODERN_SESSION_ID_RE = /^[A-Z0-9]{4}(?:-[A-Z0-9]{4}){3}$/;
const LEGACY_SESSION_ID_RE = /^\d{10,}$/;
const SESSION_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const DEFAULT_PERMISSIONS = {
  disableGroupChat: false,
  manageSelectedFiles: false,
  selectedFiles: [],
  disableExportZip: false,
  disableImportZip: false,
  disableNewFile: false,
};

app.use(express.static(path.join(__dirname)));

app.get(/^\/frontend\.html\/([A-Za-z0-9-]+)$/, (req, res) => {
  const sessionId = normalizeSessionId(req.params[0]);
  if (!isValidSessionId(sessionId)) {
    res.status(404).sendFile(path.join(__dirname, "404.html"));
    return;
  }
  res.sendFile(path.join(__dirname, "frontend.html"));
});

app.get("/health", (_req, res) => {
  res.json({ ok: true, sessions: sessions.size });
});

// Fallback: unknown GET routes go to custom 404 page.
app.get(/^(?!\/socket\.io\/).*/, (req, res) => {
  if (req.path === "/404.html") {
    res.status(404).sendFile(path.join(__dirname, "404.html"));
    return;
  }
  res.redirect(302, "/404.html");
});

function cloneFiles(files) {
  return JSON.parse(JSON.stringify(files || []));
}

function normalizeSessionId(value) {
  return String(value || "").trim().toUpperCase();
}

function isValidSessionId(value) {
  return MODERN_SESSION_ID_RE.test(value) || LEGACY_SESSION_ID_RE.test(value);
}

function generateSessionId() {
  const part = () =>
    Array.from(
      { length: 4 },
      () => SESSION_CHARS[Math.floor(Math.random() * SESSION_CHARS.length)],
    ).join("");

  let id = "";
  do {
    id = `${part()}-${part()}-${part()}-${part()}`;
  } while (sessions.has(id));
  return id;
}

function buildShareLink(baseUrl, sessionId) {
  const root = String(baseUrl || "").replace(/\/+$/, "");
  if (root) return `${root}/frontend.html/${sessionId}`;
  return `/frontend.html/${sessionId}`;
}

function sanitizeParticipant(p) {
  return {
    name: p.name,
    theme: p.theme,
    role: p.role || "participant",
    mutedChat: Boolean(p.mutedChat),
    frozenEditing: Boolean(p.frozenEditing),
    priority: Boolean(p.priority),
    currentFile: p.currentFile || null,
    joinedAt: p.joinedAt || Date.now(),
    allowedFiles: Array.isArray(p.allowedFiles) ? [...p.allowedFiles] : null,
  };
}

function normalizeName(value) {
  return String(value || "").trim().toLowerCase();
}

function makePrivateThreadKey(a, b) {
  const left = normalizeName(a);
  const right = normalizeName(b);
  return left < right ? `${left}::${right}` : `${right}::${left}`;
}

function canUseSession(sessionId, socketId) {
  const session = sessions.get(sessionId);
  if (!session) return null;
  const member = session.participants.find((p) => p.socketId === socketId);
  return member ? { session, member } : null;
}

function getChatPayloadForUser(session, userName) {
  const userKey = normalizeName(userName);
  const privateMessages = [];
  const chatState = session.chat || { group: [], private: {} };
  Object.entries(chatState.private || {}).forEach(([threadKey, messages]) => {
    if (threadKey.includes(userKey)) {
      privateMessages.push(...messages);
    }
  });
  privateMessages.sort((a, b) => a.ts - b.ts);
  return {
    groupMessages: chatState.group || [],
    privateMessages,
  };
}

function normalizePermissions(input, files) {
  const allNames = new Set((files || []).map((f) => String(f?.name || "")));
  const raw = input || {};
  const selected = Array.isArray(raw.selectedFiles) ? raw.selectedFiles : [];
  const selectedFiles = Array.from(
    new Set(
      selected
        .map((name) => String(name || "").trim())
        .filter((name) => name && allNames.has(name)),
    ),
  );

  return {
    disableGroupChat: Boolean(raw.disableGroupChat),
    manageSelectedFiles: Boolean(raw.manageSelectedFiles),
    selectedFiles,
    disableExportZip: Boolean(raw.disableExportZip),
    disableImportZip: Boolean(raw.disableImportZip),
    disableNewFile: Boolean(raw.disableNewFile),
  };
}

function normalizeAllowedFiles(files, input) {
  const allNames = new Set((files || []).map((f) => String(f?.name || "")));
  if (!Array.isArray(input)) return null;
  return Array.from(
    new Set(
      input
        .map((name) => String(name || "").trim())
        .filter((name) => name && allNames.has(name)),
    ),
  );
}

function getChangedFileNames(previousFiles, nextFiles) {
  const prevMap = new Map((previousFiles || []).map((file) => [String(file?.name || ""), String(file?.content || "")]));
  const nextMap = new Map((nextFiles || []).map((file) => [String(file?.name || ""), String(file?.content || "")]));
  const names = new Set([...prevMap.keys(), ...nextMap.keys()]);
  return Array.from(names).filter((name) => prevMap.get(name) !== nextMap.get(name));
}

function emitParticipants(sessionId) {
  const session = sessions.get(sessionId);
  if (!session) return;
  io.to(sessionId).emit(
    "collab:participants",
    session.participants.map(sanitizeParticipant),
  );
}

function emitSessionMeta(sessionId) {
  const session = sessions.get(sessionId);
  if (!session) return;
  io.to(sessionId).emit("collab:meta", {
    hostName: session.hostName,
    permissions: session.permissions,
  });
}

io.on("connection", (socket) => {
  socket.on("collab:create", (payload, ack) => {
    try {
      const requestedId = normalizeSessionId(payload?.sessionId);
      const sessionId = requestedId || generateSessionId();
      const name = String(payload?.name || "").trim();
      const theme = String(payload?.theme || "#4CAF50");
      const files = cloneFiles(payload?.files);
      const activeFileName = payload?.activeFileName || null;
      const baseUrl = String(payload?.baseUrl || "");

      if (!isValidSessionId(sessionId)) {
        ack?.({ ok: false, error: "Invalid session id." });
        return;
      }
      if (!name) {
        ack?.({ ok: false, error: "Name is required." });
        return;
      }
      if (sessions.has(sessionId)) {
        ack?.({ ok: false, error: "Session already exists." });
        return;
      }

      const participants = [{
        socketId: socket.id,
        name,
        theme,
        role: "host",
        mutedChat: false,
        frozenEditing: false,
        priority: false,
        currentFile: activeFileName || null,
        joinedAt: Date.now(),
        allowedFiles: null,
      }];
      sessions.set(sessionId, {
        files,
        activeFileName,
        participants,
        hostSocketId: socket.id,
        hostName: name,
        permissions: normalizePermissions(payload?.permissions, files),
        chat: { group: [], private: {} },
      });

      socket.join(sessionId);
      socketMeta.set(socket.id, { sessionId, name, theme });
      ack?.({
        ok: true,
        sessionId,
        shareLink: buildShareLink(baseUrl, sessionId),
        hostName: name,
        permissions: sessions.get(sessionId).permissions,
        participants: participants.map(sanitizeParticipant),
      });
      emitParticipants(sessionId);
      emitSessionMeta(sessionId);
    } catch {
      ack?.({ ok: false, error: "Failed to create session." });
    }
  });

  socket.on("collab:join", (payload, ack) => {
    try {
      const sessionId = normalizeSessionId(payload?.sessionId);
      const name = String(payload?.name || "").trim();
      const theme = String(payload?.theme || "#2196F3");

      const session = sessions.get(sessionId);
      if (!session) {
        ack?.({ ok: false, error: "Session not found." });
        return;
      }
      if (!name) {
        ack?.({ ok: false, error: "Name is required." });
        return;
      }
      const taken = session.participants.some(
        (p) => p.name.toLowerCase() === name.toLowerCase(),
      );
      if (taken) {
        ack?.({ ok: false, error: "Name already taken." });
        return;
      }

      session.participants.push({
        socketId: socket.id,
        name,
        theme,
        role: "participant",
        mutedChat: false,
        frozenEditing: false,
        priority: false,
        currentFile: session.activeFileName || null,
        joinedAt: Date.now(),
        allowedFiles: null,
      });
      socket.join(sessionId);
      socketMeta.set(socket.id, { sessionId, name, theme });

      ack?.({
        ok: true,
        files: cloneFiles(session.files),
        activeFileName: session.activeFileName || null,
        hostName: session.hostName,
        permissions: session.permissions,
        participants: session.participants.map(sanitizeParticipant),
      });
      emitParticipants(sessionId);
      emitSessionMeta(sessionId);
    } catch {
      ack?.({ ok: false, error: "Failed to join session." });
    }
  });

  socket.on("collab:resume", (payload, ack) => {
    try {
      const sessionId = normalizeSessionId(payload?.sessionId);
      const name = String(payload?.name || "").trim();
      const theme = String(payload?.theme || "#2196F3");

      const session = sessions.get(sessionId);
      if (!session) {
        ack?.({ ok: false, error: "Session not found." });
        return;
      }
      if (!name) {
        ack?.({ ok: false, error: "Name is required." });
        return;
      }

      let participant = session.participants.find(
        (p) => p.name.toLowerCase() === name.toLowerCase(),
      );

      if (participant) {
        participant.socketId = socket.id;
        participant.theme = theme || participant.theme;
      } else {
        participant = {
          socketId: socket.id,
          name,
          theme,
          role: "participant",
          mutedChat: false,
          frozenEditing: false,
          priority: false,
          currentFile: session.activeFileName || null,
          joinedAt: Date.now(),
          allowedFiles: null,
        };
        session.participants.push(participant);
      }

      if (session.hostName && session.hostName.toLowerCase() === name.toLowerCase()) {
        session.hostSocketId = socket.id;
        participant.role = "host";
      }

      socket.join(sessionId);
      socketMeta.set(socket.id, { sessionId, name: participant.name, theme: participant.theme });

      ack?.({
        ok: true,
        files: cloneFiles(session.files),
        activeFileName: session.activeFileName || null,
        hostName: session.hostName,
        permissions: session.permissions,
        participants: session.participants.map(sanitizeParticipant),
      });
      emitParticipants(sessionId);
      emitSessionMeta(sessionId);
    } catch {
      ack?.({ ok: false, error: "Failed to resume session." });
    }
  });

  socket.on("collab:chat:history", (payload, ack) => {
    try {
      const sessionId = normalizeSessionId(payload?.sessionId);
      const access = canUseSession(sessionId, socket.id);
      if (!access) {
        ack?.({ ok: false, error: "Session not found." });
        return;
      }
      ack?.({
        ok: true,
        ...getChatPayloadForUser(access.session, access.member.name),
      });
    } catch {
      ack?.({ ok: false, error: "Failed to load chat history." });
    }
  });

  socket.on("collab:chat:send", (payload, ack) => {
    try {
      const sessionId = normalizeSessionId(payload?.sessionId);
      const access = canUseSession(sessionId, socket.id);
      if (!access) {
        ack?.({ ok: false, error: "Session not found." });
        return;
      }
      const { session, member } = access;
      if (!session.chat) session.chat = { group: [], private: {} };
      const mode = String(payload?.mode || "group").trim().toLowerCase();
      const text = String(payload?.text || "").trim();
      if (!text) {
        ack?.({ ok: false, error: "Message cannot be empty." });
        return;
      }
      if (text.length > 500) {
        ack?.({ ok: false, error: "Message too long (max 500 chars)." });
        return;
      }

      const message = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        mode,
        from: member.name,
        fromTheme: member.theme || "#4CAF50",
        text,
        ts: Date.now(),
      };

      if (mode === "group") {
        if (session.permissions?.disableGroupChat) {
          ack?.({ ok: false, error: "Group chat is disabled by host." });
          return;
        }
        if (member.mutedChat) {
          ack?.({ ok: false, error: "The host muted your chat access." });
          return;
        }
        session.chat.group.push(message);
        if (session.chat.group.length > 300) session.chat.group.shift();
        io.to(sessionId).emit("collab:chat:group", message);
        ack?.({ ok: true });
        return;
      }

      if (mode !== "private") {
        ack?.({ ok: false, error: "Invalid chat mode." });
        return;
      }
      if (member.mutedChat) {
        ack?.({ ok: false, error: "The host muted your chat access." });
        return;
      }

      const toName = String(payload?.toName || "").trim();
      const target = session.participants.find(
        (p) => normalizeName(p.name) === normalizeName(toName),
      );
      if (!target) {
        ack?.({ ok: false, error: "Participant not found." });
        return;
      }
      if (target.socketId === socket.id) {
        ack?.({ ok: false, error: "Choose another participant for private chat." });
        return;
      }

      message.to = target.name;
      const threadKey = makePrivateThreadKey(member.name, target.name);
      if (!session.chat.private[threadKey]) session.chat.private[threadKey] = [];
      session.chat.private[threadKey].push(message);
      if (session.chat.private[threadKey].length > 300) {
        session.chat.private[threadKey].shift();
      }

      io.to(target.socketId).emit("collab:chat:private", message);
      io.to(socket.id).emit("collab:chat:private", message);
      ack?.({ ok: true });
    } catch {
      ack?.({ ok: false, error: "Failed to send message." });
    }
  });

  socket.on("collab:update", (payload) => {
    const sessionId = normalizeSessionId(payload?.sessionId);
    const access = canUseSession(sessionId, socket.id);
    if (!access) return;
    const { session, member } = access;
    if (member.frozenEditing) {
      socket.emit("collab:state", {
        files: cloneFiles(session.files),
        activeFileName: session.activeFileName,
        user: { name: member.name, theme: member.theme, role: member.role || "participant" },
      });
      return;
    }

    const meta = socketMeta.get(socket.id);
    const safeUser =
      meta && meta.sessionId === sessionId
        ? { name: member.name, theme: member.theme, role: member.role || "participant" }
        : null;

    const incomingFiles = cloneFiles(payload?.files);
    const requestedActiveFileName = payload?.activeFileName || null;
    const allowedFiles = Array.isArray(member.allowedFiles) ? member.allowedFiles : null;
    if (allowedFiles) {
      const changedFileNames = getChangedFileNames(session.files, incomingFiles);
      const attemptedOutsideAllowedFiles = changedFileNames.some(
        (name) => !allowedFiles.includes(name),
      );
      if (attemptedOutsideAllowedFiles) {
        socket.emit("collab:state", {
          files: cloneFiles(session.files),
          activeFileName: session.activeFileName,
          user: { name: member.name, theme: member.theme, role: member.role || "participant" },
        });
        return;
      }
    }

    session.files = incomingFiles;
    member.currentFile = requestedActiveFileName || null;
    if (!session.activeFileName || member.role === "host" || member.role === "co-host") {
      session.activeFileName = requestedActiveFileName;
    }
    session.permissions = normalizePermissions(session.permissions, session.files);
    session.participants.forEach((participant) => {
      if (Array.isArray(participant.allowedFiles)) {
        participant.allowedFiles = normalizeAllowedFiles(session.files, participant.allowedFiles);
      }
    });

    socket.to(sessionId).emit("collab:state", {
      files: cloneFiles(session.files),
      activeFileName: session.activeFileName,
      user: safeUser,
    });
    emitParticipants(sessionId);
    emitSessionMeta(sessionId);
  });

  socket.on("collab:set-role", (payload, ack) => {
    try {
      const sessionId = normalizeSessionId(payload?.sessionId);
      const session = sessions.get(sessionId);
      if (!session) {
        ack?.({ ok: false, error: "Session not found." });
        return;
      }
      if (session.hostSocketId !== socket.id) {
        ack?.({ ok: false, error: "Only host can change roles." });
        return;
      }

      const role = String(payload?.role || "").trim().toLowerCase();
      const targetName = String(payload?.targetName || "").trim().toLowerCase();
      if (!["co-host", "participant"].includes(role) || !targetName) {
        ack?.({ ok: false, error: "Invalid role update." });
        return;
      }

      const target = session.participants.find(
        (p) => p.name.toLowerCase() === targetName,
      );
      if (!target) {
        ack?.({ ok: false, error: "Participant not found." });
        return;
      }
      if (target.socketId === session.hostSocketId) {
        ack?.({ ok: false, error: "Host role cannot be changed." });
        return;
      }

      target.role = role;
      io.to(target.socketId).emit("collab:role-notice", {
        role,
        by: session.hostName || "Host",
      });
      emitParticipants(sessionId);
      ack?.({ ok: true });
    } catch {
      ack?.({ ok: false, error: "Failed to update role." });
    }
  });

  socket.on("collab:transfer-host", (payload, ack) => {
    try {
      const sessionId = normalizeSessionId(payload?.sessionId);
      const session = sessions.get(sessionId);
      if (!session) {
        ack?.({ ok: false, error: "Session not found." });
        return;
      }
      if (session.hostSocketId !== socket.id) {
        ack?.({ ok: false, error: "Only host can transfer host." });
        return;
      }
      const targetName = normalizeName(payload?.targetName);
      const target = session.participants.find((p) => normalizeName(p.name) === targetName);
      if (!target) {
        ack?.({ ok: false, error: "Participant not found." });
        return;
      }
      if (target.socketId === session.hostSocketId) {
        ack?.({ ok: false, error: "That participant is already the host." });
        return;
      }
      const currentHost = session.participants.find((p) => p.socketId === session.hostSocketId);
      if (currentHost) currentHost.role = "participant";
      target.role = "host";
      session.hostSocketId = target.socketId;
      session.hostName = target.name;
      io.to(target.socketId).emit("collab:role-notice", {
        role: "host",
        by: currentHost?.name || "Host",
      });
      emitParticipants(sessionId);
      emitSessionMeta(sessionId);
      ack?.({ ok: true });
    } catch {
      ack?.({ ok: false, error: "Failed to transfer host." });
    }
  });

  socket.on("collab:set-participant-flags", (payload, ack) => {
    try {
      const sessionId = normalizeSessionId(payload?.sessionId);
      const session = sessions.get(sessionId);
      if (!session) {
        ack?.({ ok: false, error: "Session not found." });
        return;
      }
      if (session.hostSocketId !== socket.id) {
        ack?.({ ok: false, error: "Only host can update participants." });
        return;
      }
      const targetName = normalizeName(payload?.targetName);
      const target = session.participants.find((p) => normalizeName(p.name) === targetName);
      if (!target) {
        ack?.({ ok: false, error: "Participant not found." });
        return;
      }
      if (target.socketId === session.hostSocketId) {
        ack?.({ ok: false, error: "Host cannot be updated here." });
        return;
      }
      if (typeof payload?.mutedChat === "boolean") target.mutedChat = payload.mutedChat;
      if (typeof payload?.frozenEditing === "boolean") target.frozenEditing = payload.frozenEditing;
      if (typeof payload?.priority === "boolean") target.priority = payload.priority;
      emitParticipants(sessionId);
      ack?.({ ok: true });
    } catch {
      ack?.({ ok: false, error: "Failed to update participant state." });
    }
  });

  socket.on("collab:set-participant-files", (payload, ack) => {
    try {
      const sessionId = normalizeSessionId(payload?.sessionId);
      const session = sessions.get(sessionId);
      if (!session) {
        ack?.({ ok: false, error: "Session not found." });
        return;
      }
      if (session.hostSocketId !== socket.id) {
        ack?.({ ok: false, error: "Only host can change file access." });
        return;
      }
      const targetName = normalizeName(payload?.targetName);
      const target = session.participants.find((p) => normalizeName(p.name) === targetName);
      if (!target) {
        ack?.({ ok: false, error: "Participant not found." });
        return;
      }
      if (target.socketId === session.hostSocketId) {
        ack?.({ ok: false, error: "Host already has full file access." });
        return;
      }

      const reset = Boolean(payload?.reset);
      if (reset) {
        target.allowedFiles = null;
      } else {
        target.allowedFiles = normalizeAllowedFiles(session.files, payload?.allowedFiles);
      }
      emitParticipants(sessionId);
      ack?.({ ok: true });
    } catch {
      ack?.({ ok: false, error: "Failed to update file access." });
    }
  });

  socket.on("collab:set-permissions", (payload, ack) => {
    try {
      const sessionId = normalizeSessionId(payload?.sessionId);
      const session = sessions.get(sessionId);
      if (!session) {
        ack?.({ ok: false, error: "Session not found." });
        return;
      }
      if (session.hostSocketId !== socket.id) {
        ack?.({ ok: false, error: "Only host can update permissions." });
        return;
      }

      session.permissions = normalizePermissions(payload?.permissions, session.files);
      emitSessionMeta(sessionId);
      ack?.({ ok: true, permissions: session.permissions });
    } catch {
      ack?.({ ok: false, error: "Failed to update permissions." });
    }
  });

  socket.on("collab:kick", (payload, ack) => {
    try {
      const sessionId = normalizeSessionId(payload?.sessionId);
      const session = sessions.get(sessionId);
      if (!session) {
        ack?.({ ok: false, error: "Session not found." });
        return;
      }
      if (session.hostSocketId !== socket.id) {
        ack?.({ ok: false, error: "Only host can kick participants." });
        return;
      }

      const targetName = String(payload?.targetName || "").trim().toLowerCase();
      if (!targetName) {
        ack?.({ ok: false, error: "Invalid participant name." });
        return;
      }

      const target = session.participants.find(
        (p) => p.name.toLowerCase() === targetName,
      );
      if (!target) {
        ack?.({ ok: false, error: "Participant not found." });
        return;
      }
      if (target.socketId === session.hostSocketId) {
        ack?.({ ok: false, error: "Host cannot be kicked." });
        return;
      }

      session.participants = session.participants.filter(
        (p) => p.socketId !== target.socketId,
      );
      socketMeta.delete(target.socketId);
      io.to(target.socketId).emit("collab:kicked", { sessionId });
      io.sockets.sockets.get(target.socketId)?.leave(sessionId);

      emitParticipants(sessionId);
      emitSessionMeta(sessionId);
      ack?.({ ok: true });
    } catch {
      ack?.({ ok: false, error: "Failed to kick participant." });
    }
  });

  socket.on("collab:typing", (payload) => {
    const sessionId = normalizeSessionId(payload?.sessionId);
    const access = canUseSession(sessionId, socket.id);
    if (!access) return;
    const { member } = access;
    const rawIndicator = payload?.indicator;
    const stopped =
      rawIndicator === null ||
      rawIndicator === undefined ||
      Boolean(rawIndicator?.stopped);
    socket.to(sessionId).emit("collab:typing", {
      name: member.name,
      theme: member.theme,
      editor: rawIndicator?.editor || null,
      fileName: rawIndicator?.fileName || member.currentFile || null,
      caretPos: Number(rawIndicator?.caretPos || 0),
      stopped,
      ts: Date.now(),
    });
  });

  socket.on("collab:cursor", (payload) => {
    const sessionId = normalizeSessionId(payload?.sessionId);
    const session = sessions.get(sessionId);
    if (!session) return;
    const meta = socketMeta.get(socket.id);
    if (!meta || meta.sessionId !== sessionId) return;

    const cursor = payload?.cursor
      ? {
          name: meta.name,
          theme: meta.theme,
          fileName: payload.cursor.fileName || null,
          x: Number(payload.cursor.x || 0),
          y: Number(payload.cursor.y || 0),
          ts: Date.now(),
        }
      : null;

    socket.to(sessionId).emit("collab:cursor", {
      name: meta.name,
      cursor,
    });
  });

  socket.on("disconnect", () => {
    const meta = socketMeta.get(socket.id);
    socketMeta.delete(socket.id);
    if (!meta) return;

    const session = sessions.get(meta.sessionId);
    if (!session) return;

    session.participants = session.participants.filter(
      (p) => p.socketId !== socket.id,
    );

    const removedWasHost = meta.sessionId && session.hostSocketId === socket.id;

    if (session.participants.length === 0) {
      sessions.delete(meta.sessionId);
      return;
    }

    if (removedWasHost) {
      const availableCoHost = session.participants.find((p) => p.role === "co-host");
      const nextHost =
        availableCoHost ||
        session.participants[Math.floor(Math.random() * session.participants.length)];
      session.hostSocketId = nextHost.socketId;
      session.hostName = nextHost.name;
      nextHost.role = "host";
    }

    emitParticipants(meta.sessionId);
    emitSessionMeta(meta.sessionId);
  });
});

function startServer(preferredPort) {
  const port = Number(preferredPort) || 3000;
  currentPort = port;
  server.listen(port, () => {
    console.log(`CodX Editor server running on http://localhost:${port}`);
  });
}

let currentPort = Number(PORT) || 3000;

server.on("error", (err) => {
  if (err && err.code === "EADDRINUSE") {
    const retryPort = currentPort + 1;
    console.warn(`Port ${currentPort} is in use. Retrying on ${retryPort}...`);
    setTimeout(() => startServer(retryPort), 200);
    return;
  }
  throw err;
});

startServer(PORT);
