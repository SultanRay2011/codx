const express = require("express");
const http = require("http");
const path = require("path");
const fs = require("fs");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" },
});

const PORT = process.env.PORT || 3000;
const sessions = new Map();
const socketMeta = new Map();
const editorPresenceSockets = new Set();
const adminActivity = [];
const adminSessions = new Map();
const publishedProjects = new Map();
const PUBLISHED_PROJECTS_FILE = path.join(__dirname, "published-projects.json");
const ADMIN_USERNAME = String(process.env.ADMIN_USERNAME || "administrator");
const ADMIN_PASSWORD = String(process.env.ADMIN_PASSWORD || "admin1579");
const ADMIN_COOKIE = "codx_admin_session";
const MODERN_SESSION_ID_RE = /^[A-Z0-9]{4}(?:-[A-Z0-9]{4}){3}$/;
const LEGACY_SESSION_ID_RE = /^\d{10,}$/;
const SESSION_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const DEFAULT_PERMISSIONS = {
  disableGroupChat: false,
  disableAllChat: false,
  manageSelectedFiles: false,
  selectedFiles: [],
  disableSaveProject: false,
  disableOpenSavedProjects: false,
  disableTemplates: false,
  disablePublishShare: false,
  disableExportZip: false,
  disableImportZip: false,
  disableNewFile: false,
  disableRunCode: false,
  disableConsoleAccess: false,
  readOnlyAll: false,
  roomLocked: false,
  pauseCollab: false,
  quietMode: false,
  requireJoinApproval: false,
  pinnedFile: "",
  groupHighlightFile: "",
  announcementBar: "",
  sessionEndsAt: null,
};

app.use(express.json());
app.use(express.static(path.join(__dirname)));
loadPublishedProjects();

app.get("/404-for-preview.html", (_req, res) => {
  res.status(404).sendFile(path.join(__dirname, "404-for-preview.html"));
});

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

app.post("/admin/api/auth", (req, res) => {
  const username = String(req.body?.username || "").trim();
  const password = String(req.body?.password || "");
  if (username !== ADMIN_USERNAME || password !== ADMIN_PASSWORD) {
    res.status(401).json({ ok: false, error: "Invalid admin username or password." });
    return;
  }
  const token = `${Date.now()}-${Math.random().toString(36).slice(2, 12)}`;
  adminSessions.set(token, Date.now());
  res.setHeader(
    "Set-Cookie",
    `${ADMIN_COOKIE}=${token}; HttpOnly; SameSite=Lax; Path=/; Max-Age=43200`,
  );
  res.json({ ok: true });
});

app.post("/admin/api/logout", (req, res) => {
  const token = parseCookies(req)[ADMIN_COOKIE];
  if (token) adminSessions.delete(token);
  res.setHeader(
    "Set-Cookie",
    `${ADMIN_COOKIE}=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0`,
  );
  res.json({ ok: true });
});

app.use("/admin/api", (req, res, next) => {
  if (req.path === "/auth") {
    next();
    return;
  }
  const token = parseCookies(req)[ADMIN_COOKIE];
  if (!token || !adminSessions.has(token)) {
    res.status(401).json({ ok: false, error: "Admin authentication required." });
    return;
  }
  next();
});

app.get("/admin/api/overview", (_req, res) => {
  res.json(buildAdminOverview());
});

app.get("/admin/api/sessions", (_req, res) => {
  res.json({
    sessions: Array.from(sessions.entries())
      .map(([sessionId, session]) => summarizeSession(sessionId, session))
      .sort((a, b) => b.participantCount - a.participantCount || b.createdAt - a.createdAt),
  });
});

app.get("/admin/api/session/:sessionId", (req, res) => {
  const sessionId = normalizeSessionId(req.params.sessionId);
  const session = sessions.get(sessionId);
  if (!session) {
    res.status(404).json({ ok: false, error: "Session not found." });
    return;
  }
  res.json({
    ok: true,
    session: buildAdminSessionDetail(sessionId, session),
  });
});

app.get("/admin/api/activity", (_req, res) => {
  res.json({
    activity: adminActivity.slice(0, 30),
  });
});

app.post("/admin/api/session/:sessionId/lock-toggle", (req, res) => {
  const sessionId = normalizeSessionId(req.params.sessionId);
  const session = sessions.get(sessionId);
  if (!session) {
    res.status(404).json({ ok: false, error: "Session not found." });
    return;
  }
  const nextLocked = !Boolean(session.permissions?.roomLocked);
  session.permissions = normalizePermissions(
    { ...session.permissions, roomLocked: nextLocked },
    session.files,
  );
  emitSessionMeta(sessionId);
  logAdminEvent(
    nextLocked ? "Room locked" : "Room unlocked",
    `Session ${sessionId} was ${nextLocked ? "locked" : "unlocked"} from the admin panel.`,
    sessionId,
  );
  res.json({ ok: true, session: summarizeSession(sessionId, session) });
});

app.post("/admin/api/session/:sessionId/freeze-toggle", (req, res) => {
  const sessionId = normalizeSessionId(req.params.sessionId);
  const session = sessions.get(sessionId);
  if (!session) {
    res.status(404).json({ ok: false, error: "Session not found." });
    return;
  }
  const nextPaused = !Boolean(session.permissions?.pauseCollab);
  session.permissions = normalizePermissions(
    { ...session.permissions, pauseCollab: nextPaused },
    session.files,
  );
  emitSessionMeta(sessionId);
  logAdminEvent(
    nextPaused ? "Collaboration paused" : "Collaboration resumed",
    `Session ${sessionId} is now ${nextPaused ? "paused" : "active"} from the admin panel.`,
    sessionId,
  );
  res.json({ ok: true, session: summarizeSession(sessionId, session) });
});

app.post("/admin/api/session/:sessionId/regenerate-link", (req, res) => {
  const oldSessionId = normalizeSessionId(req.params.sessionId);
  const session = sessions.get(oldSessionId);
  if (!session) {
    res.status(404).json({ ok: false, error: "Session not found." });
    return;
  }
  const nextSessionId = generateSessionId();
  sessions.delete(oldSessionId);
  sessions.set(nextSessionId, session);
  (session.participants || []).forEach((participant) => {
    const socketRef = io.sockets.sockets.get(participant.socketId);
    if (socketRef) {
      socketRef.leave(oldSessionId);
      socketRef.join(nextSessionId);
    }
    const meta = socketMeta.get(participant.socketId);
    if (meta) meta.sessionId = nextSessionId;
  });
  (session.pendingJoins || []).forEach((entry) => {
    const meta = socketMeta.get(entry.socketId);
    if (meta) meta.sessionId = nextSessionId;
  });
  const shareLink = buildShareLink(session.baseUrl || "", nextSessionId);
  io.to(nextSessionId).emit("collab:link-regenerated", {
    sessionId: nextSessionId,
    shareLink,
  });
  emitSessionMeta(nextSessionId);
  logAdminEvent(
    "Invite link regenerated",
    `Session ${oldSessionId} was moved to new session id ${nextSessionId}.`,
    nextSessionId,
  );
  res.json({ ok: true, sessionId: nextSessionId, shareLink });
});

app.post("/admin/api/session/:sessionId/end", (req, res) => {
  const sessionId = normalizeSessionId(req.params.sessionId);
  const session = sessions.get(sessionId);
  if (!session) {
    res.status(404).json({ ok: false, error: "Session not found." });
    return;
  }
  logAdminEvent(
    "Session ended",
    `Session ${sessionId} was ended from the admin panel.`,
    sessionId,
  );
  endSession(sessionId, "An admin ended this collaboration session.");
  res.json({ ok: true });
});

app.post("/api/publish", (req, res) => {
  const files = cloneFiles(req.body?.files);
  const activeFileName = String(req.body?.activeFileName || "");
  const projectName = String(req.body?.projectName || "CodX Project").trim().slice(0, 80);
  if (!Array.isArray(files) || !files.length) {
    res.status(400).json({ ok: false, error: "No project files to publish." });
    return;
  }
  const id = `PUB-${Math.random().toString(36).slice(2, 8).toUpperCase()}-${Date.now().toString(36).toUpperCase()}`;
  publishedProjects.set(id, {
    id,
    projectName,
    files,
    activeFileName,
    createdAt: Date.now(),
  });
  savePublishedProjects();
  res.json({
    ok: true,
    id,
    shareLink: `${req.protocol}://${req.get("host")}/published/${id}`,
  });
});

app.get("/published/:id", (req, res) => {
  const id = String(req.params.id || "").trim();
  const project = publishedProjects.get(id);
  if (!project) {
    res.status(404).sendFile(path.join(__dirname, "404.html"));
    return;
  }
  res.setHeader("Cache-Control", "no-store, max-age=0, must-revalidate");
  res.setHeader("Pragma", "no-cache");
  const sentTitle =
    req.headers["x-codx-publish-title"] ||
    req.headers["x-publish-title"] ||
    "";
  const requestedFile = String(req.query.file || "").trim();
  res.send(buildPublishedHtml(project, requestedFile, sentTitle));
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

function loadPublishedProjects() {
  try {
    if (!fs.existsSync(PUBLISHED_PROJECTS_FILE)) return;
    const raw = fs.readFileSync(PUBLISHED_PROJECTS_FILE, "utf8");
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return;
    parsed.forEach((entry) => {
      if (!entry || !entry.id || !Array.isArray(entry.files)) return;
      publishedProjects.set(String(entry.id), {
        id: String(entry.id),
        projectName: String(entry.projectName || "CodX Project"),
        files: cloneFiles(entry.files),
        activeFileName: String(entry.activeFileName || ""),
        createdAt: Number(entry.createdAt || Date.now()),
      });
    });
  } catch (error) {
    console.error("Failed to load published projects:", error);
  }
}

function savePublishedProjects() {
  try {
    const serialized = JSON.stringify(Array.from(publishedProjects.values()), null, 2);
    fs.writeFileSync(PUBLISHED_PROJECTS_FILE, serialized, "utf8");
  } catch (error) {
    console.error("Failed to save published projects:", error);
  }
}

function parseCookies(req) {
  const header = String(req.headers?.cookie || "");
  return header.split(";").reduce((acc, part) => {
    const [rawKey, ...rawValue] = part.split("=");
    const key = String(rawKey || "").trim();
    if (!key) return acc;
    acc[key] = decodeURIComponent(rawValue.join("=").trim());
    return acc;
  }, {});
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

function buildPublishedHtml(project, requestedFileName = "", requestTitle = "") {
  const files = Array.isArray(project?.files) ? project.files : [];
  const activeFileName = String(project?.activeFileName || "");
  const requestedFile = String(requestedFileName || "").trim();
  const requestTitleText = String(requestTitle || "").trim();
  const normalizeFileName = (value) => String(value || "").trim().replace(/^\.\/+/, "").toLowerCase();
  const resolveBuiltInAsset = (rawPath) => {
    const normalized = String(rawPath || "").trim().replace(/^\.\/+/, "").replace(/^\/+/, "").toLowerCase();
    if (normalized === "cx.png") return "/cx.png";
    return "";
  };
  const resolveFile = (rawName, typeHint = "") => {
    const target = normalizeFileName(rawName);
    if (!target) return null;
    return files.find((file) => {
      const candidate = normalizeFileName(file.name);
      const sameName =
        candidate === target ||
        candidate.endsWith(`/${target}`) ||
        candidate.split("/").pop() === target.split("/").pop();
      if (!sameName) return false;
      if (!typeHint) return true;
      return String(file.type || "").toLowerCase() === typeHint.toLowerCase();
    }) || null;
  };

  const htmlFile =
    (requestedFile
      ? resolveFile(requestedFile, "html")
      : resolveFile("index.html", "html") ||
        files.find(
          (file) =>
            String(file?.name || "") === activeFileName &&
            String(file?.type || "").toLowerCase() === "html",
        )) ||
    files.find((file) => String(file?.type || "").toLowerCase() === "html");

  if (!htmlFile) {
    if (requestedFile) {
      return `<!doctype html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Published Page Not Found</title><style>html,body{margin:0;padding:0;font-family:Segoe UI,Tahoma,sans-serif;background:#f6fff7;color:#18211b}body{padding:32px}div{max-width:760px;margin:0 auto;background:#fff;border:1px solid rgba(20,41,27,.12);border-radius:20px;padding:24px;box-shadow:0 18px 40px rgba(24,46,31,.08)}h1{margin:0 0 12px}p{color:#5b675f;line-height:1.7}</style></head><body><div><h1>Page not found</h1><p>The published project does not contain <strong>${escapeHtmlAttribute(requestedFile)}</strong>.</p></div></body></html>`;
    }
    return `<!doctype html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtmlAttribute(project?.projectName || "Published Project")}</title><style>body{font-family:Segoe UI,Tahoma,sans-serif;background:#f6fff7;color:#18211b;padding:32px}.box{max-width:760px;margin:0 auto;background:#fff;border:1px solid rgba(20,41,27,.12);border-radius:20px;padding:24px;box-shadow:0 18px 40px rgba(24,46,31,.08)}h1{margin:0 0 12px}p{color:#5b675f;line-height:1.7}</style></head><body><div class="box"><h1>No HTML file to publish</h1><p>This project does not contain an HTML file, so there is nothing previewable to publish yet.</p></div></body></html>`;
  }

  let html = String(htmlFile.content || "");
  html = html.replace(/<link\b([^>]*?)href=["']([^"']+)["']([^>]*?)>/gi, (full, before, href) => {
    const builtInAsset = resolveBuiltInAsset(href);
    if (builtInAsset) {
      return full.replace(href, builtInAsset);
    }
    const cssFile = resolveFile(href, "css");
    if (!cssFile) return full;
    return `<style data-published-source="${escapeHtmlAttribute(cssFile.name)}">\n${String(cssFile.content || "")}\n</style>`;
  });

  html = html.replace(/<script\b([^>]*?)src=["']([^"']+)["']([^>]*)><\/script>/gi, (full, before, src) => {
    const jsFile = resolveFile(src, "js");
    if (!jsFile) return full;
    return `<script data-published-source="${escapeHtmlAttribute(jsFile.name)}">\n${String(jsFile.content || "")}\n<\/script>`;
  });

  const publishLinkBase = `/published/${encodeURIComponent(project.id)}`;
  const toPublishedLink = (rawHref) => {
    const raw = String(rawHref || "").trim();
    if (!raw) return "";
    const [pathPart, hashPart] = raw.split("#");
    const [pathOnly] = pathPart.split("?");
    const baseName = pathOnly.replace(/^\.\/+/, "").replace(/^\/+/, "");
    const linked = resolveFile(baseName, "html");
    const target = linked ? linked.name : baseName || raw;
    const hash = hashPart ? `#${hashPart}` : "";
    return `${publishLinkBase}?file=${encodeURIComponent(target)}${hash}`;
  };

  html = html.replace(
    /<a([^>]*)href=["']([^"']+\.html(?:[?#][^"']*)?)["']([^>]*)>/gi,
    (full, before, href, after) => {
      const url = toPublishedLink(href);
      return url ? `<a${before}href="${url}"${after}>` : full;
    },
  );

  html = html.replace(
    /<form([^>]*)action=["']([^"']+\.html(?:[?#][^"']*)?)["']([^>]*)>/gi,
    (full, before, action, after) => {
      const url = toPublishedLink(action);
      return url ? `<form${before}action="${url}"${after}>` : full;
    },
  );

  html = html.replace(
    /\bonclick=(["'])([\s\S]*?)\1/gi,
    (match, quote, handlerCode) => {
      const rewritten = handlerCode.replace(
        /((?:window\.)?location(?:\.href)?\s*=\s*|window\.location\.assign\(\s*|window\.open\(\s*)(['"])([^'"]+\.html(?:[?#][^'"]*)?)(\2)(\s*\))?/gi,
        (_m, prefix, q, href, _q2, closing = "") => {
          const url = toPublishedLink(href);
          if (!url) return _m;
          if (/window\.open\(\s*$/i.test(prefix)) {
            return `window.open(${q}${url}${q}${closing || ")"})`;
          }
          if (/assign\(\s*$/i.test(prefix)) {
            return `window.location.assign(${q}${url}${q}${closing || ")"})`;
          }
          return `window.location.href = ${q}${url}${q}`;
        },
      );
      return `onclick=${quote}${rewritten}${quote}`;
    },
  );

  html = html.replace(
    /<(img|video|audio|source)([^>]*)src=["']([^"']+)["']([^>]*)>/gi,
    (full, tag, before, src, after) => {
      if (
        src.startsWith("data:") ||
        src.startsWith("http://") ||
        src.startsWith("https://") ||
        src.startsWith("blob:") ||
        src.startsWith("/")
      ) {
        return full;
      }
      const builtInAsset = resolveBuiltInAsset(src);
      if (!builtInAsset) return full;
      return `<${tag}${before} src="${builtInAsset}"${after}>`;
    },
  );

  const publishTitle = escapeHtmlAttribute(requestTitleText || project?.projectName || htmlFile.name);
  if (!/<title\b/i.test(html)) {
    html = html.replace(
      /<head([^>]*)>/i,
      `<head$1><title>${publishTitle}</title>`,
    );
  } else {
    html = html.replace(/<title[^>]*>([\s\S]*?)<\/title>/i, (_m, existing) => {
      const base = String(existing || "").trim();
      if (!base) return `<title>${publishTitle}</title>`;
      return `<title>${escapeHtmlAttribute(base)} | ${publishTitle}</title>`;
    });
  }

  const publishBaseReset =
    '<style data-codx-publish-reset>html,body{margin:0;padding:0;min-height:100%;}body{box-sizing:border-box;}*,*::before,*::after{box-sizing:inherit;}</style>';

  if (/<head\b[^>]*>/i.test(html)) {
    html = html.replace(/<head([^>]*)>/i, `<head$1>${publishBaseReset}`);
  } else {
    html = `${publishBaseReset}${html}`;
  }

  return html;
}

function escapeHtmlAttribute(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function emitAdminUpdate(reason = "state") {
  io.emit("admin:update", {
    reason: String(reason || "state"),
    ts: Date.now(),
  });
}

function logAdminEvent(title, detail, sessionId = "") {
  adminActivity.unshift({
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    title: String(title || "").trim(),
    detail: String(detail || "").trim(),
    sessionId: String(sessionId || "").trim(),
    ts: Date.now(),
  });
  if (adminActivity.length > 120) {
    adminActivity.length = 120;
  }
  emitAdminUpdate("activity");
}

function summarizeSession(sessionId, session) {
  const participants = Array.isArray(session?.participants) ? session.participants : [];
  const permissions = session?.permissions || DEFAULT_PERMISSIONS;
  const chatState = session?.chat || { group: [], private: {} };
  const pendingJoins = Array.isArray(session?.pendingJoins) ? session.pendingJoins : [];
  return {
    sessionId,
    hostName: session?.hostName || "Unknown",
    shareLink: buildShareLink(session?.baseUrl || "", sessionId),
    participantCount: participants.length,
    pendingJoinCount: pendingJoins.length,
    publishedProjects: publishedProjects.size,
    fileCount: Array.isArray(session?.files) ? session.files.length : 0,
    groupMessageCount: Array.isArray(chatState.group) ? chatState.group.length : 0,
    privateThreadCount: Object.keys(chatState.private || {}).length,
    createdAt: Math.min(
      ...participants.map((participant) => Number(participant.joinedAt) || Date.now()),
      Date.now(),
    ),
    activeFileName: session?.activeFileName || "",
    roomLocked: Boolean(permissions.roomLocked),
    paused: Boolean(permissions.pauseCollab),
    readOnlyAll: Boolean(permissions.readOnlyAll),
    disableSaveProject: Boolean(permissions.disableSaveProject),
    disableOpenSavedProjects: Boolean(permissions.disableOpenSavedProjects),
    disableTemplates: Boolean(permissions.disableTemplates),
    disablePublishShare: Boolean(permissions.disablePublishShare),
    requireJoinApproval: Boolean(permissions.requireJoinApproval),
    disableAllChat: Boolean(permissions.disableAllChat),
    pinnedFile: permissions.pinnedFile || "",
    hostRoleCount: participants.filter((participant) => String(participant.role) === "co-host").length,
    flaggedParticipants: participants.filter(
      (participant) =>
        participant.mutedChat ||
        participant.frozenEditing ||
        participant.priority ||
        Array.isArray(participant.allowedFiles),
    ).length,
  };
}

function buildAdminOverview() {
  const summaryList = Array.from(sessions.entries()).map(([sessionId, session]) =>
    summarizeSession(sessionId, session),
  );
  const participants = summaryList.reduce((sum, item) => sum + item.participantCount, 0);
  const pending = summaryList.reduce((sum, item) => sum + item.pendingJoinCount, 0);
  const flagged = summaryList.reduce((sum, item) => sum + item.flaggedParticipants, 0);
  const locked = summaryList.filter((item) => item.roomLocked).length;
  return {
    health: {
      ok: true,
      uptimeSeconds: Math.floor(process.uptime()),
      sessions: sessions.size,
      connectedSockets: io.engine.clientsCount,
    },
    stats: {
      activeUsers: editorPresenceSockets.size,
      collaboratingUsers: participants,
      liveSessions: sessions.size,
      moderationItems: pending + flagged,
      capacityLoad:
        editorPresenceSockets.size === 0
          ? 0
          : Math.min(100, Math.round((editorPresenceSockets.size / 200) * 100)),
      pendingJoins: pending,
      lockedRooms: locked,
      publishedProjects: publishedProjects.size,
    },
    queue: {
      pendingJoinApprovals: pending,
      flaggedParticipants: flagged,
      lockedRooms: locked,
      pausedRooms: summaryList.filter((item) => item.paused).length,
    },
    sessions: summaryList
      .sort((a, b) => b.participantCount - a.participantCount || b.pendingJoinCount - a.pendingJoinCount)
      .slice(0, 6),
  };
}

function buildAdminSessionDetail(sessionId, session) {
  const summary = summarizeSession(sessionId, session);
  return {
    ...summary,
    permissions: { ...(session?.permissions || DEFAULT_PERMISSIONS) },
    participants: (session?.participants || []).map(sanitizeParticipant),
    files: cloneFiles(session?.files || []),
    chat: {
      groupCount: Array.isArray(session?.chat?.group) ? session.chat.group.length : 0,
      privateThreadCount: Object.keys(session?.chat?.private || {}).length,
    },
  };
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
    disabledFeatures: Array.isArray(p.disabledFeatures) ? [...p.disabledFeatures] : [],
  };
}

function sanitizeBanEntry(entry) {
  return {
    deviceId: String(entry?.deviceId || ""),
    name: String(entry?.name || "Unknown"),
    bannedAt: Number(entry?.bannedAt || Date.now()),
    bannedBy: String(entry?.bannedBy || "Host"),
  };
}

function normalizeDisabledFeatures(features) {
  const allowed = new Set([
    "chat",
    "saveProject",
    "openSaved",
    "templates",
    "publishShare",
    "runCode",
    "consoleAccess",
  ]);
  if (!Array.isArray(features)) return [];
  return [...new Set(features
    .map((item) => String(item || "").trim())
    .filter((item) => allowed.has(item)))];
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

function canUseLimitedRoomTools(session, socketId) {
  const member = session?.participants?.find((p) => p.socketId === socketId);
  if (!member) return null;
  const role = String(member.role || "participant");
  if (role !== "host" && role !== "co-host") return null;
  return member;
}

function canModerateTarget(session, socketId, target) {
  const actor = canUseLimitedRoomTools(session, socketId);
  if (!actor || !target) return null;
  const actorRole = String(actor.role || "participant");
  const targetRole = String(target.role || "participant");
  if (targetRole === "host") return null;
  if (actorRole === "co-host" && targetRole !== "participant") return null;
  return actor;
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
    disableAllChat: Boolean(raw.disableAllChat),
    manageSelectedFiles: Boolean(raw.manageSelectedFiles),
    selectedFiles,
    disableSaveProject: Boolean(raw.disableSaveProject),
    disableOpenSavedProjects: Boolean(raw.disableOpenSavedProjects),
    disableTemplates: Boolean(raw.disableTemplates),
    disablePublishShare: Boolean(raw.disablePublishShare),
    disableExportZip: Boolean(raw.disableExportZip),
    disableImportZip: Boolean(raw.disableImportZip),
    disableNewFile: Boolean(raw.disableNewFile),
    disableRunCode: Boolean(raw.disableRunCode),
    disableConsoleAccess: Boolean(raw.disableConsoleAccess),
    readOnlyAll: Boolean(raw.readOnlyAll),
    roomLocked: Boolean(raw.roomLocked),
    pauseCollab: Boolean(raw.pauseCollab),
    quietMode: Boolean(raw.quietMode),
    requireJoinApproval: Boolean(raw.requireJoinApproval),
    pinnedFile:
      raw.pinnedFile && allNames.has(String(raw.pinnedFile || "").trim())
        ? String(raw.pinnedFile || "").trim()
        : "",
    groupHighlightFile:
      raw.groupHighlightFile && allNames.has(String(raw.groupHighlightFile || "").trim())
        ? String(raw.groupHighlightFile || "").trim()
        : "",
    announcementBar: String(raw.announcementBar || "").trim().slice(0, 220),
    sessionEndsAt:
      Number(raw.sessionEndsAt) > Date.now()
        ? Number(raw.sessionEndsAt)
        : null,
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
  emitAdminUpdate("participants");
}

function emitSessionMeta(sessionId) {
  const session = sessions.get(sessionId);
  if (!session) return;
  io.to(sessionId).emit("collab:meta", {
    sessionId,
    hostName: session.hostName,
    permissions: session.permissions,
    pendingJoins: (session.pendingJoins || []).map((entry) => ({
      socketId: entry.socketId,
      name: entry.name,
      theme: entry.theme,
      requestedAt: entry.requestedAt,
    })),
    bans: (session.bans || []).map(sanitizeBanEntry),
    shareLink: buildShareLink(session.baseUrl || "", sessionId),
  });
  emitAdminUpdate("meta");
}

function endSession(sessionId, reason = "Session ended.") {
  const session = sessions.get(sessionId);
  if (!session) return;
  io.to(sessionId).emit("collab:session-ended", { reason });
  (session.participants || []).forEach((participant) => {
    const socketRef = io.sockets.sockets.get(participant.socketId);
    if (socketRef) {
      socketRef.leave(sessionId);
    }
    socketMeta.delete(participant.socketId);
  });
  (session.pendingJoins || []).forEach((entry) => {
    const socketRef = io.sockets.sockets.get(entry.socketId);
    if (socketRef) {
      socketRef.leave(sessionId);
    }
    socketMeta.delete(entry.socketId);
    io.to(entry.socketId).emit("collab:join-rejected", { reason });
  });
  sessions.delete(sessionId);
  emitAdminUpdate("session-ended");
}

function finalizeApprovedJoin(sessionId, socketId, name, theme) {
  const session = sessions.get(sessionId);
  if (!session) return false;
  const meta = socketMeta.get(socketId) || {};
  const deviceId = String(meta.deviceId || "").trim();
  if (deviceId && Array.isArray(session.bans) && session.bans.some((entry) => entry.deviceId === deviceId)) {
    io.to(socketId).emit("collab:join-rejected", { reason: "This device is banned from the session." });
    return false;
  }
  if (session.participants.some((p) => p.name.toLowerCase() === String(name || "").trim().toLowerCase())) {
    return false;
  }
  session.participants.push({
    socketId,
    name,
    theme,
    role: "participant",
    mutedChat: false,
    frozenEditing: false,
    priority: false,
    currentFile: session.activeFileName || null,
    joinedAt: Date.now(),
    allowedFiles: null,
    disabledFeatures: [],
    deviceId,
  });
  const socketRef = io.sockets.sockets.get(socketId);
  if (socketRef) socketRef.join(sessionId);
  socketMeta.set(socketId, { sessionId, name, theme, deviceId });
  io.to(socketId).emit("collab:join-approved", {
    ok: true,
    sessionId,
    files: cloneFiles(session.files),
    activeFileName: session.activeFileName || null,
    hostName: session.hostName,
    permissions: session.permissions,
    participants: session.participants.map(sanitizeParticipant),
    shareLink: buildShareLink(session.baseUrl || "", sessionId),
  });
  logAdminEvent("Join approved", `${name} was approved for session ${sessionId}.`, sessionId);
  emitParticipants(sessionId);
  emitSessionMeta(sessionId);
  return true;
}

io.on("connection", (socket) => {
  socket.on("editor:presence", () => {
    if (!editorPresenceSockets.has(socket.id)) {
      editorPresenceSockets.add(socket.id);
      emitAdminUpdate("editor-presence");
    }
  });

  socket.on("collab:create", (payload, ack) => {
    try {
      const requestedId = normalizeSessionId(payload?.sessionId);
      const sessionId = requestedId || generateSessionId();
      const name = String(payload?.name || "").trim();
      const theme = String(payload?.theme || "#4CAF50");
      const files = cloneFiles(payload?.files);
      const activeFileName = payload?.activeFileName || null;
      const baseUrl = String(payload?.baseUrl || "");
      const deviceId = String(payload?.deviceId || "").trim();

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
        disabledFeatures: [],
        deviceId,
      }];
      sessions.set(sessionId, {
        files,
        activeFileName,
        participants,
        hostSocketId: socket.id,
        hostName: name,
        baseUrl,
        permissions: normalizePermissions(payload?.permissions, files),
        chat: { group: [], private: {} },
        pendingJoins: [],
        bans: [],
      });

      socket.join(sessionId);
      socketMeta.set(socket.id, { sessionId, name, theme, deviceId });
      ack?.({
        ok: true,
        sessionId,
        shareLink: buildShareLink(baseUrl, sessionId),
        hostName: name,
        permissions: sessions.get(sessionId).permissions,
        participants: participants.map(sanitizeParticipant),
      });
      logAdminEvent("Session created", `${name} created session ${sessionId}.`, sessionId);
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
      const deviceId = String(payload?.deviceId || "").trim();

      const session = sessions.get(sessionId);
      if (!session) {
        ack?.({ ok: false, error: "Session not found." });
        return;
      }
      if (!name) {
        ack?.({ ok: false, error: "Name is required." });
        return;
      }
      if (deviceId && Array.isArray(session.bans) && session.bans.some((entry) => entry.deviceId === deviceId)) {
        ack?.({ ok: false, error: "This device is banned from the session." });
        return;
      }
      if (session.permissions?.roomLocked) {
        ack?.({ ok: false, error: "Room is locked." });
        return;
      }
      const taken = session.participants.some(
        (p) => p.name.toLowerCase() === name.toLowerCase(),
      );
      if (taken) {
        ack?.({ ok: false, error: "Name already taken." });
        return;
      }
      const colorTaken = session.participants.some(
        (p) => String(p.theme || "").trim().toLowerCase() === theme.trim().toLowerCase(),
      );
      if (colorTaken) {
        ack?.({ ok: false, error: "Color already taken." });
        return;
      }
      if (session.permissions?.requireJoinApproval) {
        const alreadyPending = (session.pendingJoins || []).some(
          (entry) => entry.name.toLowerCase() === name.toLowerCase(),
        );
        if (alreadyPending) {
          ack?.({ ok: false, error: "Join request already pending." });
          return;
        }
        session.pendingJoins.push({
          socketId: socket.id,
          name,
          theme,
          requestedAt: Date.now(),
          deviceId,
        });
        socketMeta.set(socket.id, { sessionId, name, theme, deviceId });
        logAdminEvent("Join approval requested", `${name} requested access to session ${sessionId}.`, sessionId);
        emitSessionMeta(sessionId);
        ack?.({ ok: false, pending: true, error: "Waiting for host approval." });
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
        disabledFeatures: [],
        deviceId,
      });
      socket.join(sessionId);
      socketMeta.set(socket.id, { sessionId, name, theme, deviceId });

      ack?.({
        ok: true,
        files: cloneFiles(session.files),
        activeFileName: session.activeFileName || null,
        hostName: session.hostName,
        permissions: session.permissions,
        participants: session.participants.map(sanitizeParticipant),
      });
      logAdminEvent("Participant joined", `${name} joined session ${sessionId}.`, sessionId);
      emitParticipants(sessionId);
      emitSessionMeta(sessionId);
    } catch {
      ack?.({ ok: false, error: "Failed to join session." });
    }
  });

  socket.on("collab:palette", (payload, ack) => {
    try {
      const sessionId = normalizeSessionId(payload?.sessionId);
      const session = sessions.get(sessionId);
      if (!session) {
        ack?.({ ok: false, error: "Session not found." });
        return;
      }
      ack?.({
        ok: true,
        participants: session.participants.map(sanitizeParticipant),
      });
    } catch {
      ack?.({ ok: false, error: "Failed to load participant colors." });
    }
  });

  socket.on("collab:resume", (payload, ack) => {
    try {
      const sessionId = normalizeSessionId(payload?.sessionId);
      const name = String(payload?.name || "").trim();
      const theme = String(payload?.theme || "#2196F3");
      const deviceId = String(payload?.deviceId || "").trim();

      const session = sessions.get(sessionId);
      if (!session) {
        ack?.({ ok: false, error: "Session not found." });
        return;
      }
      if (!name) {
        ack?.({ ok: false, error: "Name is required." });
        return;
      }
      if (deviceId && Array.isArray(session.bans) && session.bans.some((entry) => entry.deviceId === deviceId)) {
        ack?.({ ok: false, error: "This device is banned from the session." });
        return;
      }

      let participant = session.participants.find(
        (p) => p.name.toLowerCase() === name.toLowerCase(),
      );

      if (participant) {
        participant.socketId = socket.id;
        participant.theme = theme || participant.theme;
        participant.deviceId = deviceId || participant.deviceId || "";
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
          disabledFeatures: [],
          deviceId,
        };
        session.participants.push(participant);
      }

      if (session.hostName && session.hostName.toLowerCase() === name.toLowerCase()) {
        session.hostSocketId = socket.id;
        participant.role = "host";
      }

      socket.join(sessionId);
      socketMeta.set(socket.id, {
        sessionId,
        name: participant.name,
        theme: participant.theme,
        deviceId: participant.deviceId || deviceId,
      });

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
        if (session.permissions?.disableAllChat) {
          ack?.({ ok: false, error: "Chat is disabled for the group." });
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
      if (session.permissions?.disableAllChat) {
        ack?.({ ok: false, error: "Chat is disabled for the group." });
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
    if (
      member.frozenEditing ||
      session.permissions?.readOnlyAll ||
      session.permissions?.pauseCollab
    ) {
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
      logAdminEvent("Role updated", `${target.name} is now ${role} in session ${sessionId}.`, sessionId);
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
      logAdminEvent("Host transferred", `${target.name} became host of session ${sessionId}.`, sessionId);
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
      const targetName = normalizeName(payload?.targetName);
      const target = session.participants.find((p) => normalizeName(p.name) === targetName);
      if (!target) {
        ack?.({ ok: false, error: "Participant not found." });
        return;
      }
      const actor = canModerateTarget(session, socket.id, target);
      if (!actor) {
        ack?.({ ok: false, error: "You do not have permission to update this participant." });
        return;
      }
      if (typeof payload?.mutedChat === "boolean") target.mutedChat = payload.mutedChat;
      if (typeof payload?.frozenEditing === "boolean") target.frozenEditing = payload.frozenEditing;
      if (typeof payload?.priority === "boolean") target.priority = payload.priority;
      logAdminEvent("Participant flags updated", `${target.name} was updated in session ${sessionId}.`, sessionId);
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
      const targetName = normalizeName(payload?.targetName);
      const target = session.participants.find((p) => normalizeName(p.name) === targetName);
      if (!target) {
        ack?.({ ok: false, error: "Participant not found." });
        return;
      }
      const actor = canModerateTarget(session, socket.id, target);
      if (!actor) {
        ack?.({ ok: false, error: "You do not have permission to change this file access." });
        return;
      }

      const reset = Boolean(payload?.reset);
      if (reset) {
        target.allowedFiles = null;
      } else {
        target.allowedFiles = normalizeAllowedFiles(session.files, payload?.allowedFiles);
      }
      logAdminEvent("File access updated", `${target.name}'s file access was changed in session ${sessionId}.`, sessionId);
      emitParticipants(sessionId);
      ack?.({ ok: true });
    } catch {
      ack?.({ ok: false, error: "Failed to update file access." });
    }
  });

  socket.on("collab:set-participant-feature-access", (_payload, ack) => {
    ack?.({ ok: false, error: "Feature access is controlled from room-wide group settings only." });
  });

  socket.on("collab:set-group-feature-access", (_payload, ack) => {
    ack?.({ ok: false, error: "Feature access is controlled from room-wide group settings only." });
  });

  socket.on("collab:set-permissions", (payload, ack) => {
    try {
      const sessionId = normalizeSessionId(payload?.sessionId);
      const session = sessions.get(sessionId);
      if (!session) {
        ack?.({ ok: false, error: "Session not found." });
        return;
      }
      const actor = canUseLimitedRoomTools(session, socket.id);
      if (!actor) {
        ack?.({ ok: false, error: "Only host or co-host can update these settings." });
        return;
      }

      const normalizedNext = normalizePermissions(payload?.permissions, session.files);
      if (String(actor.role || "") === "co-host") {
        const cohostOnly = {
          ...session.permissions,
          pinnedFile: normalizedNext.pinnedFile,
        };
        session.permissions = normalizePermissions(cohostOnly, session.files);
      } else {
        session.permissions = normalizedNext;
      }
      logAdminEvent("Room permissions updated", `${actor.name} updated room controls in session ${sessionId}.`, sessionId);
      emitSessionMeta(sessionId);
      ack?.({ ok: true, permissions: session.permissions });
    } catch {
      ack?.({ ok: false, error: "Failed to update permissions." });
    }
  });

  socket.on("collab:clear-group-chat", (payload, ack) => {
    try {
      const sessionId = normalizeSessionId(payload?.sessionId);
      const session = sessions.get(sessionId);
      if (!session) {
        ack?.({ ok: false, error: "Session not found." });
        return;
      }
      const actor = canUseLimitedRoomTools(session, socket.id);
      if (!actor) {
        ack?.({ ok: false, error: "Only host or co-host can clear group chat." });
        return;
      }
      if (!session.chat) session.chat = { group: [], private: {} };
      session.chat.group = [];
      io.to(sessionId).emit("collab:chat:cleared", { mode: "group" });
      logAdminEvent("Group chat cleared", `Group chat was cleared in session ${sessionId}.`, sessionId);
      ack?.({ ok: true });
    } catch {
      ack?.({ ok: false, error: "Failed to clear group chat." });
    }
  });

  socket.on("collab:bring-to-file", (payload, ack) => {
    try {
      const sessionId = normalizeSessionId(payload?.sessionId);
      const session = sessions.get(sessionId);
      if (!session) {
        ack?.({ ok: false, error: "Session not found." });
        return;
      }
      const actor = canUseLimitedRoomTools(session, socket.id);
      if (!actor) {
        ack?.({ ok: false, error: "Only host or co-host can bring everyone to a file." });
        return;
      }
      const fileName = String(payload?.fileName || "").trim();
      if (!session.files.some((file) => file.name === fileName)) {
        ack?.({ ok: false, error: "File not found." });
        return;
      }
      session.activeFileName = fileName;
      session.participants.forEach((participant) => {
        participant.currentFile = fileName;
      });
      io.to(sessionId).emit("collab:bring-to-file", { fileName });
      logAdminEvent("Participants brought to file", `Session ${sessionId} was brought to ${fileName}.`, sessionId);
      emitParticipants(sessionId);
      emitSessionMeta(sessionId);
      ack?.({ ok: true });
    } catch {
      ack?.({ ok: false, error: "Failed to bring everyone to file." });
    }
  });

  socket.on("collab:save-snapshot", (payload, ack) => {
    try {
      const sessionId = normalizeSessionId(payload?.sessionId);
      const session = sessions.get(sessionId);
      if (!session) {
        ack?.({ ok: false, error: "Session not found." });
        return;
      }
      if (session.hostSocketId !== socket.id) {
        ack?.({ ok: false, error: "Only host can save a session snapshot." });
        return;
      }
      ack?.({
        ok: true,
        snapshot: {
          sessionId,
          createdAt: Date.now(),
          hostName: session.hostName,
          permissions: session.permissions,
          participants: session.participants.map(sanitizeParticipant),
          files: cloneFiles(session.files),
          chat: session.chat || { group: [], private: {} },
        },
      });
    } catch {
      ack?.({ ok: false, error: "Failed to save session snapshot." });
    }
  });

  socket.on("collab:regenerate-link", (payload, ack) => {
    try {
      const oldSessionId = normalizeSessionId(payload?.sessionId);
      const session = sessions.get(oldSessionId);
      if (!session) {
        ack?.({ ok: false, error: "Session not found." });
        return;
      }
      if (session.hostSocketId !== socket.id) {
        ack?.({ ok: false, error: "Only host can regenerate the invite link." });
        return;
      }
      const nextSessionId = generateSessionId();
      sessions.delete(oldSessionId);
      sessions.set(nextSessionId, session);
      (session.participants || []).forEach((participant) => {
        const socketRef = io.sockets.sockets.get(participant.socketId);
        if (socketRef) {
          socketRef.leave(oldSessionId);
          socketRef.join(nextSessionId);
        }
        const meta = socketMeta.get(participant.socketId);
        if (meta) meta.sessionId = nextSessionId;
      });
      (session.pendingJoins || []).forEach((entry) => {
        const meta = socketMeta.get(entry.socketId);
        if (meta) meta.sessionId = nextSessionId;
      });
      const shareLink = buildShareLink(session.baseUrl || "", nextSessionId);
      io.to(nextSessionId).emit("collab:link-regenerated", {
        sessionId: nextSessionId,
        shareLink,
      });
      logAdminEvent("Invite link regenerated", `Session ${oldSessionId} was regenerated as ${nextSessionId}.`, nextSessionId);
      emitSessionMeta(nextSessionId);
      ack?.({ ok: true, sessionId: nextSessionId, shareLink });
    } catch {
      ack?.({ ok: false, error: "Failed to regenerate invite link." });
    }
  });

  socket.on("collab:approve-join", (payload, ack) => {
    try {
      const sessionId = normalizeSessionId(payload?.sessionId);
      const session = sessions.get(sessionId);
      if (!session) {
        ack?.({ ok: false, error: "Session not found." });
        return;
      }
      if (session.hostSocketId !== socket.id) {
        ack?.({ ok: false, error: "Only host can approve joins." });
        return;
      }
      const socketId = String(payload?.socketId || "").trim();
      const request = (session.pendingJoins || []).find((entry) => entry.socketId === socketId);
      if (!request) {
        ack?.({ ok: false, error: "Join request not found." });
        return;
      }
      session.pendingJoins = session.pendingJoins.filter((entry) => entry.socketId !== socketId);
      const joined = finalizeApprovedJoin(sessionId, request.socketId, request.name, request.theme);
      if (!joined) {
        io.to(request.socketId).emit("collab:join-rejected", { reason: "Name already taken." });
        emitSessionMeta(sessionId);
        ack?.({ ok: false, error: "Could not approve this join request." });
        return;
      }
      ack?.({ ok: true });
      emitSessionMeta(sessionId);
    } catch {
      ack?.({ ok: false, error: "Failed to approve join request." });
    }
  });

  socket.on("collab:reject-join", (payload, ack) => {
    try {
      const sessionId = normalizeSessionId(payload?.sessionId);
      const session = sessions.get(sessionId);
      if (!session) {
        ack?.({ ok: false, error: "Session not found." });
        return;
      }
      if (session.hostSocketId !== socket.id) {
        ack?.({ ok: false, error: "Only host can reject joins." });
        return;
      }
      const socketId = String(payload?.socketId || "").trim();
      const request = (session.pendingJoins || []).find((entry) => entry.socketId === socketId);
      if (!request) {
        ack?.({ ok: false, error: "Join request not found." });
        return;
      }
      session.pendingJoins = session.pendingJoins.filter((entry) => entry.socketId !== socketId);
      socketMeta.delete(socketId);
      io.to(socketId).emit("collab:join-rejected", { reason: "The host rejected your join request." });
      logAdminEvent("Join rejected", `${request.name} was rejected from session ${sessionId}.`, sessionId);
      ack?.({ ok: true });
      emitSessionMeta(sessionId);
    } catch {
      ack?.({ ok: false, error: "Failed to reject join request." });
    }
  });

  socket.on("collab:end-session", (payload, ack) => {
    try {
      const sessionId = normalizeSessionId(payload?.sessionId);
      const session = sessions.get(sessionId);
      if (!session) {
        ack?.({ ok: false, error: "Session not found." });
        return;
      }
      if (session.hostSocketId !== socket.id) {
        ack?.({ ok: false, error: "Only host can end the session." });
        return;
      }
      logAdminEvent("Session ended", `${sessionId} was ended by the host.`, sessionId);
      ack?.({ ok: true });
      endSession(sessionId, "The host ended the collaboration session.");
    } catch {
      ack?.({ ok: false, error: "Failed to end session." });
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
      const actor = canModerateTarget(session, socket.id, target);
      if (!actor) {
        ack?.({ ok: false, error: "You do not have permission to kick this participant." });
        return;
      }

      session.participants = session.participants.filter(
        (p) => p.socketId !== target.socketId,
      );
      socketMeta.delete(target.socketId);
      io.to(target.socketId).emit("collab:kicked", { sessionId });
      io.sockets.sockets.get(target.socketId)?.leave(sessionId);

      logAdminEvent("Participant kicked", `${target.name} was removed from session ${sessionId}.`, sessionId);
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

  socket.on("collab:ban", (payload, ack) => {
    try {
      const sessionId = normalizeSessionId(payload?.sessionId);
      const session = sessions.get(sessionId);
      if (!session) {
        ack?.({ ok: false, error: "Session not found." });
        return;
      }
      const targetName = normalizeName(payload?.targetName);
      const target = session.participants.find((p) => normalizeName(p.name) === targetName);
      if (!target) {
        ack?.({ ok: false, error: "Participant not found." });
        return;
      }
      const actor = canModerateTarget(session, socket.id, target);
      if (!actor) {
        ack?.({ ok: false, error: "You do not have permission to ban this participant." });
        return;
      }
      const targetMeta = socketMeta.get(target.socketId);
      const deviceId = String(target.deviceId || targetMeta?.deviceId || "").trim();
      if (!deviceId) {
        ack?.({ ok: false, error: "This participant device cannot be banned right now." });
        return;
      }
      if (!Array.isArray(session.bans)) session.bans = [];
      if (!session.bans.some((entry) => String(entry.deviceId || "") === deviceId)) {
        session.bans.unshift({
          deviceId,
          name: target.name,
          bannedAt: Date.now(),
          bannedBy: actor.name,
        });
      }
      session.pendingJoins = (session.pendingJoins || []).filter((entry) => String(entry.deviceId || "") !== deviceId);
      session.participants = session.participants.filter((p) => p.socketId !== target.socketId);
      io.to(target.socketId).emit("collab:banned", { sessionId });
      const socketRef = io.sockets.sockets.get(target.socketId);
      if (socketRef) socketRef.leave(sessionId);
      socketMeta.delete(target.socketId);
      logAdminEvent("Participant banned", `${target.name} was banned from session ${sessionId}.`, sessionId);
      emitParticipants(sessionId);
      emitSessionMeta(sessionId);
      ack?.({ ok: true });
    } catch {
      ack?.({ ok: false, error: "Failed to ban participant." });
    }
  });

  socket.on("collab:unban", (payload, ack) => {
    try {
      const sessionId = normalizeSessionId(payload?.sessionId);
      const session = sessions.get(sessionId);
      if (!session) {
        ack?.({ ok: false, error: "Session not found." });
        return;
      }
      const actor = canUseLimitedRoomTools(session, socket.id);
      if (!actor) {
        ack?.({ ok: false, error: "Only host or co-host can unban devices." });
        return;
      }
      const deviceId = String(payload?.deviceId || "").trim();
      const before = Array.isArray(session.bans) ? session.bans.length : 0;
      session.bans = (session.bans || []).filter((entry) => String(entry.deviceId || "") !== deviceId);
      if (session.bans.length === before) {
        ack?.({ ok: false, error: "Ban entry not found." });
        return;
      }
      logAdminEvent("Device unbanned", `${actor.name} removed a device ban in session ${sessionId}.`, sessionId);
      emitSessionMeta(sessionId);
      ack?.({ ok: true });
    } catch {
      ack?.({ ok: false, error: "Failed to unban device." });
    }
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
    const removedEditorPresence = editorPresenceSockets.delete(socket.id);
    const meta = socketMeta.get(socket.id);
    socketMeta.delete(socket.id);
    if (!meta) {
      if (removedEditorPresence) emitAdminUpdate("editor-presence");
      return;
    }

    const session = sessions.get(meta.sessionId);
    if (!session) {
      if (removedEditorPresence) emitAdminUpdate("editor-presence");
      return;
    }

    if (Array.isArray(session.pendingJoins) && session.pendingJoins.length) {
      const before = session.pendingJoins.length;
      session.pendingJoins = session.pendingJoins.filter((entry) => entry.socketId !== socket.id);
      if (session.pendingJoins.length !== before) {
        emitSessionMeta(meta.sessionId);
      }
    }

    session.participants = session.participants.filter(
      (p) => p.socketId !== socket.id,
    );

    const removedWasHost = meta.sessionId && session.hostSocketId === socket.id;

    if (session.participants.length === 0) {
      sessions.delete(meta.sessionId);
      emitAdminUpdate("disconnect");
      if (removedEditorPresence) emitAdminUpdate("editor-presence");
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
      logAdminEvent("Host reassigned", `${nextHost.name} became host of session ${meta.sessionId} after a disconnect.`, meta.sessionId);
    }

    emitParticipants(meta.sessionId);
    emitSessionMeta(meta.sessionId);
    emitAdminUpdate("disconnect");
    if (removedEditorPresence) emitAdminUpdate("editor-presence");
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

setInterval(() => {
  const now = Date.now();
  Array.from(sessions.entries()).forEach(([sessionId, session]) => {
    if (Number(session?.permissions?.sessionEndsAt || 0) > 0 && Number(session.permissions.sessionEndsAt) <= now) {
      endSession(sessionId, "The collaboration session timer ended.");
    }
  });
}, 1000);




