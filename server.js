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

      const participants = [{ socketId: socket.id, name, theme, role: "host" }];
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

      session.participants.push({ socketId: socket.id, name, theme, role: "participant" });
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
    const session = sessions.get(sessionId);
    if (!session) return;

    session.files = cloneFiles(payload?.files);
    session.activeFileName = payload?.activeFileName || null;
    session.permissions = normalizePermissions(session.permissions, session.files);

    socket.to(sessionId).emit("collab:state", {
      files: cloneFiles(session.files),
      activeFileName: session.activeFileName,
      user: payload?.user || null,
    });
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
      emitParticipants(sessionId);
      ack?.({ ok: true });
    } catch {
      ack?.({ ok: false, error: "Failed to update role." });
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
    if (!sessions.has(sessionId)) return;
    socket.to(sessionId).emit("collab:typing", payload?.indicator || null);
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
      const randomIndex = Math.floor(Math.random() * session.participants.length);
      const nextHost = session.participants[randomIndex];
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
