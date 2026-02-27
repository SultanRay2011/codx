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

app.use(express.static(path.join(__dirname)));

app.get(/^\/codx-editor\.html\/[A-Za-z0-9-]+$/, (_req, res) => {
  res.sendFile(path.join(__dirname, "codx-editor.html"));
});

app.get("/health", (_req, res) => {
  res.json({ ok: true, sessions: sessions.size });
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

function emitParticipants(sessionId) {
  const session = sessions.get(sessionId);
  if (!session) return;
  io.to(sessionId).emit("collab:participants", session.participants);
}

io.on("connection", (socket) => {
  socket.on("collab:create", (payload, ack) => {
    try {
      const sessionId = normalizeSessionId(payload?.sessionId);
      const name = String(payload?.name || "").trim();
      const theme = String(payload?.theme || "#4CAF50");
      const files = cloneFiles(payload?.files);
      const activeFileName = payload?.activeFileName || null;

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

      const participants = [{ socketId: socket.id, name, theme }];
      sessions.set(sessionId, {
        files,
        activeFileName,
        participants,
      });

      socket.join(sessionId);
      socketMeta.set(socket.id, { sessionId, name, theme });
      ack?.({
        ok: true,
        sessionId,
        participants: participants.map((p) => ({ name: p.name, theme: p.theme })),
      });
      emitParticipants(sessionId);
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

      session.participants.push({ socketId: socket.id, name, theme });
      socket.join(sessionId);
      socketMeta.set(socket.id, { sessionId, name, theme });

      ack?.({
        ok: true,
        files: cloneFiles(session.files),
        activeFileName: session.activeFileName || null,
        participants: session.participants.map((p) => ({
          name: p.name,
          theme: p.theme,
        })),
      });
      emitParticipants(sessionId);
    } catch {
      ack?.({ ok: false, error: "Failed to join session." });
    }
  });

  socket.on("collab:update", (payload) => {
    const sessionId = normalizeSessionId(payload?.sessionId);
    const session = sessions.get(sessionId);
    if (!session) return;

    session.files = cloneFiles(payload?.files);
    session.activeFileName = payload?.activeFileName || null;

    socket.to(sessionId).emit("collab:state", {
      files: cloneFiles(session.files),
      activeFileName: session.activeFileName,
      user: payload?.user || null,
    });
  });

  socket.on("collab:typing", (payload) => {
    const sessionId = normalizeSessionId(payload?.sessionId);
    if (!sessions.has(sessionId)) return;
    socket.to(sessionId).emit("collab:typing", payload?.indicator || null);
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

    if (session.participants.length === 0) {
      sessions.delete(meta.sessionId);
      return;
    }

    emitParticipants(meta.sessionId);
  });
});

server.listen(PORT, () => {
  console.log(`CodX server running on http://localhost:${PORT}`);
});
