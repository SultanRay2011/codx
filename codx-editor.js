// PART 1: INITIALIZATION & CONSTANTS
const iframe = document.getElementById("output");
const autoRunCheckbox = document.getElementById("autoRun");
const showConsoleCheckbox = document.getElementById("showConsole");
const themeToggle = document.getElementById("themeToggle");
const consoleContainer = document.querySelector(".console-container");
const consoleOutput = document.getElementById("consoleOutput");
const divider = document.querySelector(".divider");
const editorsPanel = document.querySelector(".editors");
const lineNumbers = document.getElementById("lineNumbers");
const editorContainer = document.querySelector(".editor-container");
const settingsBtn = document.getElementById("settingsBtn");
const settingsModal = document.getElementById("settingsModal");
const closeSettingsBtn = document.getElementById("closeSettingsBtn");
const applySettingsBtn = document.getElementById("applySettings");
const resetSettingsBtn = document.getElementById("resetSettings");
const editorBgColorInput = document.getElementById("editorBgColor");
const editorBgColorText = document.getElementById("editorBgColorText");
const editorTextColorInput = document.getElementById("editorTextColor");
const editorTextColorText = document.getElementById("editorTextColorText");
const editorTextSizeInput = document.getElementById("editorTextSize");
const textSizeValue = document.getElementById("textSizeValue");
const editorFontFamilySelect = document.getElementById("editorFontFamily");
const settingsPreview = document.getElementById("settingsPreview");
const newFileBtn = document.getElementById("newFileBtn");
const fileList = document.getElementById("fileList");
const collabBtn = document.getElementById("collabBtn");
const collabModal = document.getElementById("collabModal");
const modalTitle = document.getElementById("modalTitle");
const modalBody = document.getElementById("modalBody");
const modalDoneBtn = document.getElementById("modalDoneBtn");
const closeModalBtn = document.getElementById("closeModalBtn");
const typingIndicatorEl = document.getElementById("typingIndicator");
const previewFullscreenBtn = document.getElementById("previewFullscreenBtn");
const previewIframe = document.getElementById("output");
const errorMsgEl = document.getElementById("errorMsg");

// ADDED: Tag suggestion elements
const suggestionPopup = document.getElementById("suggestionPopup");
let activeSuggestion = -1;

const selfClosingTags = [
  "img",
  "br",
  "hr",
  "input",
  "meta",
  "link",
  "area",
  "base",
  "col",
  "embed",
  "param",
  "source",
  "track",
  "wbr",
];

// Enhanced tag data with categories, icons, and descriptions
const htmlTagsData = {
  structure: [
    {
      tag: "html",
      icon: "🌐",
      desc: "Root element of HTML document",
      attrs: ["lang"],
    },
    { tag: "head", icon: "📋", desc: "Container for metadata", attrs: [] },
    { tag: "body", icon: "📄", desc: "Main content container", attrs: [] },
    {
      tag: "header",
      icon: "🎯",
      desc: "Header section",
      attrs: ["id", "class"],
    },
    {
      tag: "footer",
      icon: "📌",
      desc: "Footer section",
      attrs: ["id", "class"],
    },
    {
      tag: "main",
      icon: "📰",
      desc: "Main content area",
      attrs: ["id", "class"],
    },
    {
      tag: "section",
      icon: "📦",
      desc: "Generic section",
      attrs: ["id", "class"],
    },
    {
      tag: "article",
      icon: "📝",
      desc: "Self-contained content",
      attrs: ["id", "class"],
    },
    {
      tag: "aside",
      icon: "📎",
      desc: "Sidebar content",
      attrs: ["id", "class"],
    },
    {
      tag: "nav",
      icon: "🧭",
      desc: "Navigation links",
      attrs: ["id", "class"],
    },
    {
      tag: "div",
      icon: "⬜",
      desc: "Generic container",
      attrs: ["id", "class"],
    },
  ],
  text: [
    { tag: "h1", icon: "📰", desc: "Main heading", attrs: ["id", "class"] },
    {
      tag: "h2",
      icon: "📰",
      desc: "Subheading level 2",
      attrs: ["id", "class"],
    },
    {
      tag: "h3",
      icon: "📰",
      desc: "Subheading level 3",
      attrs: ["id", "class"],
    },
    {
      tag: "h4",
      icon: "📰",
      desc: "Subheading level 4",
      attrs: ["id", "class"],
    },
    {
      tag: "h5",
      icon: "📰",
      desc: "Subheading level 5",
      attrs: ["id", "class"],
    },
    {
      tag: "h6",
      icon: "📰",
      desc: "Subheading level 6",
      attrs: ["id", "class"],
    },
    { tag: "p", icon: "¶", desc: "Paragraph", attrs: ["id", "class"] },
    {
      tag: "span",
      icon: "✏️",
      desc: "Inline text container",
      attrs: ["id", "class"],
    },
    { tag: "strong", icon: "💪", desc: "Strong importance (bold)", attrs: [] },
    { tag: "em", icon: "✨", desc: "Emphasized text (italic)", attrs: [] },
    { tag: "b", icon: "B", desc: "Bold text", attrs: [] },
    { tag: "i", icon: "I", desc: "Italic text", attrs: [] },
    { tag: "u", icon: "U̲", desc: "Underlined text", attrs: [] },
    { tag: "mark", icon: "🖍️", desc: "Highlighted text", attrs: [] },
    { tag: "small", icon: "🔍", desc: "Smaller text", attrs: [] },
    { tag: "code", icon: "💻", desc: "Inline code", attrs: [] },
    { tag: "pre", icon: "📋", desc: "Preformatted text", attrs: [] },
    { tag: "blockquote", icon: "💬", desc: "Block quotation", attrs: ["cite"] },
  ],
  lists: [
    { tag: "ul", icon: "•", desc: "Unordered list", attrs: ["id", "class"] },
    {
      tag: "ol",
      icon: "1.",
      desc: "Ordered list",
      attrs: ["id", "class", "type", "start"],
    },
    { tag: "li", icon: "→", desc: "List item", attrs: ["value"] },
    { tag: "dl", icon: "📖", desc: "Description list", attrs: [] },
    { tag: "dt", icon: "📌", desc: "Description term", attrs: [] },
    { tag: "dd", icon: "💬", desc: "Description details", attrs: [] },
  ],
  media: [
    {
      tag: "img",
      icon: "🖼️",
      desc: "Image",
      badge: "self-closing",
      attrs: ["src", "alt", "width", "height"],
    },
    {
      tag: "video",
      icon: "🎥",
      desc: "Video player",
      attrs: ["src", "controls", "width", "height"],
    },
    {
      tag: "audio",
      icon: "🔊",
      desc: "Audio player",
      attrs: ["src", "controls"],
    },
    {
      tag: "source",
      icon: "📂",
      desc: "Media source",
      badge: "self-closing",
      attrs: ["src", "type"],
    },
    { tag: "picture", icon: "🖼️", desc: "Responsive images", attrs: [] },
    {
      tag: "canvas",
      icon: "🎨",
      desc: "Graphics canvas",
      attrs: ["id", "width", "height"],
    },
    {
      tag: "svg",
      icon: "🎨",
      desc: "Vector graphics",
      attrs: ["width", "height", "viewBox"],
    },
    {
      tag: "iframe",
      icon: "🖥️",
      desc: "Embedded frame",
      attrs: ["src", "width", "height"],
    },
  ],
  forms: [
    {
      tag: "form",
      icon: "📝",
      desc: "Form container",
      attrs: ["action", "method"],
    },
    {
      tag: "input",
      icon: "⌨️",
      desc: "Input field",
      badge: "self-closing",
      attrs: ["type", "name", "id", "placeholder", "value"],
    },
    {
      tag: "textarea",
      icon: "📄",
      desc: "Multi-line text input",
      attrs: ["name", "id", "rows", "cols"],
    },
    {
      tag: "button",
      icon: "🔘",
      desc: "Clickable button",
      attrs: ["type", "id", "class"],
    },
    { tag: "select", icon: "📋", desc: "Dropdown menu", attrs: ["name", "id"] },
    {
      tag: "option",
      icon: "•",
      desc: "Dropdown option",
      attrs: ["value", "selected"],
    },
    { tag: "label", icon: "🏷️", desc: "Input label", attrs: ["for"] },
    { tag: "fieldset", icon: "📦", desc: "Group form elements", attrs: [] },
    { tag: "legend", icon: "📌", desc: "Fieldset caption", attrs: [] },
  ],
  table: [
    {
      tag: "table",
      icon: "📊",
      desc: "Table container",
      attrs: ["id", "class"],
    },
    { tag: "thead", icon: "📋", desc: "Table header group", attrs: [] },
    { tag: "tbody", icon: "📄", desc: "Table body group", attrs: [] },
    { tag: "tfoot", icon: "📌", desc: "Table footer group", attrs: [] },
    { tag: "tr", icon: "→", desc: "Table row", attrs: [] },
    { tag: "th", icon: "📌", desc: "Header cell", attrs: ["scope"] },
    { tag: "td", icon: "⬜", desc: "Data cell", attrs: ["colspan", "rowspan"] },
  ],
  links: [
    { tag: "a", icon: "🔗", desc: "Hyperlink", attrs: ["href", "target"] },
    {
      tag: "link",
      icon: "📎",
      desc: "External resource",
      badge: "self-closing",
      attrs: ["rel", "href"],
    },
  ],
  meta: [
    {
      tag: "meta",
      icon: "ℹ️",
      desc: "Metadata",
      badge: "self-closing",
      attrs: ["charset", "name", "content"],
    },
    { tag: "title", icon: "📰", desc: "Page title", attrs: [] },
    { tag: "style", icon: "🎨", desc: "CSS styles", attrs: [] },
    {
      tag: "script",
      icon: "⚙️",
      desc: "JavaScript code",
      attrs: ["src", "type"],
    },
  ],
};

// Flatten all tags for quick lookup
const allHtmlTags = Object.values(htmlTagsData)
  .flat()
  .map((t) => t.tag);
// END: Tag suggestion elements

const htmlTags = [
  "a",
  "abbr",
  "address",
  "area",
  "article",
  "aside",
  "audio",
  "b",
  "base",
  "bdi",
  "bdo",
  "blockquote",
  "body",
  "br",
  "button",
  "canvas",
  "caption",
  "cite",
  "code",
  "col",
  "colgroup",
  "data",
  "datalist",
  "dd",
  "del",
  "details",
  "dfn",
  "dialog",
  "div",
  "dl",
  "dt",
  "em",
  "embed",
  "fieldset",
  "figcaption",
  "figure",
  "footer",
  "form",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "head",
  "header",
  "hr",
  "html",
  "i",
  "iframe",
  "img",
  "input",
  "ins",
  "kbd",
  "label",
  "legend",
  "li",
  "link",
  "main",
  "map",
  "mark",
  "meta",
  "meter",
  "nav",
  "noscript",
  "object",
  "ol",
  "optgroup",
  "option",
  "output",
  "p",
  "param",
  "picture",
  "pre",
  "progress",
  "q",
  "rp",
  "rt",
  "ruby",
  "s",
  "samp",
  "script",
  "section",
  "select",
  "small",
  "source",
  "span",
  "strong",
  "style",
  "sub",
  "summary",
  "sup",
  "table",
  "tbody",
  "td",
  "template",
  "textarea",
  "tfoot",
  "th",
  "thead",
  "time",
  "title",
  "tr",
  "track",
  "u",
  "ul",
  "var",
  "video",
  "wbr",
];
// END: Tag suggestion elements

let hasUnsavedChanges = false;
let autoRunTimeout;
let sessionData = {};
let typingTimer;
let myInfo = {};
let projectFiles = [
  {
    name: "index.html",
    type: "html",
    content: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CodX Editor</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <h1>Welcome to CodX Editor</h1>
    <script src="script.js"></script>
</body>
</html>`,
    active: true,
  },
  {
    name: "style.css",
    type: "css",
    content: `h1 {
    color: rgb(2, 255, 116);
    text-align: center;
    font-family: Arial, sans-serif;
}`,
    active: false,
  },
  {
    name: "script.js",
    type: "js",
    content: `console.log('Hello World from CodX!');`,
    active: false,
  },
];
let activeFile = projectFiles[0];

const defaultSettings = {
  bgColor: "#1E1E1E",
  textColor: "#ffffff",
  textSize: "14",
  fontFamily: "monospace",
};

// PART 2: UTILITY FUNCTIONS
function safeLocalStorage(method, key, value = null) {
  try {
    if (method === "get") return localStorage.getItem(key);
    else if (method === "set") {
      localStorage.setItem(key, value);
      return true;
    } else if (method === "remove") {
      localStorage.removeItem(key);
      return true;
    }
  } catch (e) {
    console.warn("localStorage not available:", e);
    return null;
  }
}

function showNotification(message, type = "info") {
  const notification = document.createElement("div");
  notification.textContent = message;
  notification.style.cssText = `
    position: fixed; top: 80px; right: 20px; padding: 15px 20px;
    background: ${
      type === "error" ? "#ff5555" : type === "success" ? "#4CAF50" : "#2196F3"
    };
    color: white; border-radius: 4px; z-index: 10000; font-weight: bold;
    box-shadow: 0 4px 6px rgba(0,0,0,0.3); animation: slideIn 0.3s ease;
  `;
  document.body.appendChild(notification);
  setTimeout(() => {
    notification.style.animation = "slideOut 0.3s ease";
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

const style = document.createElement("style");
style.textContent = `
  @keyframes slideIn { from { transform: translateX(400px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
  @keyframes slideOut { from { transform: translateX(0); opacity: 1; } to { transform: translateX(400px); opacity: 0; } }
`;
document.head.appendChild(style);

function clearConsole() {
  consoleOutput.innerHTML = "";
  showNotification("Console cleared", "info");
}

function debouncedUpdatePreview() {
  clearTimeout(autoRunTimeout);
  autoRunTimeout = setTimeout(updatePreview, 0);
}

function renderFileList() {
  fileList.innerHTML = "";
  projectFiles.forEach((file) => {
    const fileItem = document.createElement("div");
    fileItem.className = `file-item ${file.active ? "active" : ""}`;
    fileItem.innerHTML = `
      <span>${file.name}</span>
      <button class="delete-file" data-file="${file.name}" aria-label="Delete ${file.name}">
        <i class="fa-solid fa-trash"></i>
      </button>
    `;
    fileItem.addEventListener("click", (e) => {
      if (e.target.closest(".delete-file")) return;
      switchFile(file.name);
    });
    fileItem
      .querySelector(".delete-file")
      .addEventListener("click", () => deleteFile(file.name));
    fileList.appendChild(fileItem);
  });
}

function switchFile(fileName) {
  projectFiles.forEach((file) => {
    file.active = file.name === fileName;
    if (file.active) {
      activeFile = file;
      const editor = document.getElementById("activeEditor");
      editor.value = file.content;
      updateLineNumbers(editor);
      syncScroll(editor);
      // Hide suggestions when switching files
      if (suggestionPopup) suggestionPopup.style.display = "none";
    }
  });
  renderFileList();
  syncProjectWithSession();
}

function createNewFile() {
  const name = prompt("Enter file name (e.g., newfile.html):");
  if (!name) return;
  const ext = name.split(".").pop().toLowerCase();

  if (!["html", "css", "js"].includes(ext)) {
    showNotification("File must be .html, .css, or .js", "error");
    return;
  }
  if (projectFiles.some((file) => file.name === name)) {
    showNotification("File name already exists", "error");
    return;
  }

  // Define the default HTML template
  const defaultHTML = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CodX Editor</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <h1>Welcome to CodX Editor</h1>
    <script src="script.js"></script>
</body>
</html>`;

  const newFile = {
    name,
    type: ext,
    // Use template for HTML files, otherwise empty string
    content: ext === "html" ? defaultHTML : "",
    active: true,
  };

  projectFiles.forEach((file) => (file.active = false));
  projectFiles.push(newFile);
  activeFile = newFile;

  const editor = document.getElementById("activeEditor");
  editor.value = newFile.content; // Set editor value to the template
  updateLineNumbers(editor);
  renderFileList();
  syncProjectWithSession();
  showNotification(`File ${name} created`, "success");
}

function deleteFile(fileName) {
  if (projectFiles.length <= 1) {
    showNotification("Cannot delete the last file", "error");
    return;
  }
  if (confirm(`Delete ${fileName}?`)) {
    projectFiles = projectFiles.filter((file) => file.name !== fileName);
    if (activeFile.name === fileName) {
      activeFile = projectFiles[0];
      activeFile.active = true;
      const editor = document.getElementById("activeEditor");
      editor.value = activeFile.content;
      updateLineNumbers(editor);
      syncScroll(editor);
    }
    renderFileList();
    syncProjectWithSession();
    showNotification(`File ${fileName} deleted`, "success");
  }
}

// PART 3: SETTINGS MANAGEMENT
function loadSettings() {
  const savedSettings = safeLocalStorage("get", "editorSettings");
  if (savedSettings) {
    try {
      const settings = JSON.parse(savedSettings);
      editorBgColorInput.value = settings.bgColor;
      editorBgColorText.value = settings.bgColor;
      editorTextColorInput.value = settings.textColor;
      editorTextColorText.value = settings.textColor;
      editorTextSizeInput.value = settings.textSize;
      textSizeValue.textContent = settings.textSize + "px";
      editorFontFamilySelect.value = settings.fontFamily;
    } catch (e) {
      console.error("Error loading settings:", e);
      resetToDefaultSettings();
    }
  } else {
    resetToDefaultSettings();
  }
  updatePreviewBox();
  applySettingsToEditors();
}

function resetToDefaultSettings() {
  editorBgColorInput.value = defaultSettings.bgColor;
  editorBgColorText.value = defaultSettings.bgColor;
  editorTextColorInput.value = defaultSettings.textColor;
  editorTextColorText.value = defaultSettings.textColor;
  editorTextSizeInput.value = defaultSettings.textSize;
  textSizeValue.textContent = defaultSettings.textSize + "px";
  editorFontFamilySelect.value = defaultSettings.fontFamily;
}

function updatePreviewBox() {
  settingsPreview.style.backgroundColor = editorBgColorInput.value;
  settingsPreview.style.color = editorTextColorInput.value;
  settingsPreview.style.fontSize = editorTextSizeInput.value + "px";
  settingsPreview.style.fontFamily = editorFontFamilySelect.value;
}

function applySettingsToEditors() {
  const editor = document.getElementById("activeEditor");

  editor.style.fontSize = editorTextSizeInput.value + "px";
  editor.style.fontFamily = editorFontFamilySelect.value;
  lineNumbers.style.fontSize = editorTextSizeInput.value + "px";
}

editorBgColorInput.addEventListener("input", (e) => {
  editorBgColorText.value = e.target.value;
  updatePreviewBox();
});

editorTextColorInput.addEventListener("input", (e) => {
  editorTextColorText.value = e.target.value;
  updatePreviewBox();
});

editorTextSizeInput.addEventListener("input", (e) => {
  textSizeValue.textContent = e.target.value + "px";
  updatePreviewBox();
});

editorFontFamilySelect.addEventListener("change", updatePreviewBox);

settingsBtn.addEventListener("click", () => {
  loadSettings();
  settingsModal.style.display = "flex";
});

closeSettingsBtn.addEventListener("click", () => {
  settingsModal.style.display = "none";
});

settingsModal.addEventListener("click", (e) => {
  if (e.target === settingsModal) settingsModal.style.display = "none";
});

applySettingsBtn.addEventListener("click", () => {
  const settings = {
    bgColor: editorBgColorInput.value,
    textColor: editorTextColorInput.value,
    textSize: editorTextSizeInput.value,
    fontFamily: editorFontFamilySelect.value,
  };
  if (safeLocalStorage("set", "editorSettings", JSON.stringify(settings))) {
    applySettingsToEditors();
    showNotification("Settings applied successfully!", "success");
    settingsModal.style.display = "none";
  } else {
    showNotification("Error saving settings", "error");
  }
});

resetSettingsBtn.addEventListener("click", () => {
  if (confirm("Are you sure you want to reset all settings to default?")) {
    safeLocalStorage("remove", "editorSettings");
    resetToDefaultSettings();
    updatePreviewBox();
    applySettingsToEditors();
    showNotification("Settings reset to default!", "success");
  }
});

// PART 4: THEME & UI CONTROLS
themeToggle.addEventListener("change", () => {
  document.body.classList.toggle("light", themeToggle.checked);
  safeLocalStorage("set", "theme", themeToggle.checked ? "light" : "dark");
});

const savedTheme = safeLocalStorage("get", "theme");
if (savedTheme === "light") {
  themeToggle.checked = true;
  document.body.classList.add("light");
}

showConsoleCheckbox.addEventListener("change", () => {
  consoleContainer.classList.toggle("show", showConsoleCheckbox.checked);
});

// PART 5: PREVIEW & LINE NUMBERS (FIXED CONSOLE OUTPUT WITH ACCURATE LINE NUMBERS)
function updatePreview() {
  const htmlFile = projectFiles.find((f) => f.type === "html");
  if (!htmlFile) {
    iframe.srcdoc =
      '<h3 style="text-align:center;color:#aaa;">No HTML file found</h3>';
    return;
  }

  let html = htmlFile.content;
  consoleOutput.innerHTML = ""; // Clear console

  // === 1. Replace <link rel="stylesheet" href="style.css"> (handles both attribute orders)
  html = html.replace(
    /<link[^>]*(?:rel=["']stylesheet["'][^>]*href=["']([^"']+)["']|href=["']([^"']+)["'][^>]*rel=["']stylesheet["'])[^>]*\/?>/gi,
    (match, href1, href2) => {
      const href = href1 || href2;
      const cssFile = projectFiles.find(
        (f) => f.name.toLowerCase() === href.toLowerCase() && f.type === "css"
      );
      if (cssFile) {
        return `<style>${cssFile.content}</style>`;
      } else {
        const fileName = href.split("/").pop();
        appendConsoleMessage(
          "warn",
          `WARNING: CSS file not found: ${fileName}`
        );
        return match; // Keep original link tag
      }
    }
  );

  // === 2. Replace <script src="script.js"></script> WITH FILE NAME MARKERS
  html = html.replace(
    /<script[^>]*src=["']([^"']+)["'][^>]*><\/script>/gi,
    (match, src) => {
      const jsFile = projectFiles.find(
        (f) => f.name.toLowerCase() === src.toLowerCase() && f.type === "js"
      );
      if (jsFile) {
        // Wrap JS with file markers and line tracking
        const lines = jsFile.content.split("\n");
        const numberedContent = lines
          .map((line, idx) => {
            return line; // Keep original content
          })
          .join("\n");

        return `<script data-filename="${jsFile.name}">
/* ===== FILE: ${jsFile.name} ===== */
(function() {
  try {
${jsFile.content}
  } catch (e) {
    console.error('[${jsFile.name}] ' + e.message);
    if (e.stack) {
      const stackLines = e.stack.split('\\n');
      stackLines.forEach(line => {
        if (line.includes('<anonymous>') || line.includes('eval')) {
          console.error('  ' + line);
        }
      });
    }
  }
})();
/* ===== END: ${jsFile.name} ===== */
</script>`;
      } else {
        const fileName = src.split("/").pop();
        appendConsoleMessage("warn", `WARNING: JS file not found: ${fileName}`);
        return `<script src="${src}?file=${encodeURIComponent(
          fileName
        )}"></script>`;
      }
    }
  );

  // === 3. Handle <a href> links to other HTML files
  html = html.replace(
    /<a([^>]*)href=["']([^"']+\.html)["']([^>]*)>/gi,
    (match, before, href, after) => {
      // Extract just the filename
      const fileName = href.split("/").pop();

      // Check if this HTML file exists in project
      const linkedFile = projectFiles.find(
        (f) =>
          f.name.toLowerCase() === fileName.toLowerCase() && f.type === "html"
      );

      if (linkedFile) {
        // File exists - make the link load that file's content in the preview
        const encodedHTML = encodeURIComponent(linkedFile.content);
        return `<a${before}href="javascript:void(0)" onclick="window.location.href='data:text/html;charset=utf-8,${encodedHTML}'"${after}>`;
      }

      // File doesn't exist - keep original
      return match;
    }
  );

  // === 3. Handle media: <img>, <video>, <audio> src attributes
  html = html.replace(
    /<(img|video|audio)[^>]*src=["']([^"']+)["'][^>]*>/gi,
    (match, tag, src) => {
      const mediaFile = projectFiles.find(
        (f) => f.name.toLowerCase() === src.toLowerCase() && f.type === "media"
      );
      if (mediaFile && mediaFile.content) {
        return `<${tag} src="${mediaFile.content}">`;
      } else {
        const fileName = src.split("/").pop();
        appendConsoleMessage(
          "warn",
          `WARNING: Media file not found: ${fileName}`
        );
        return `<${tag} src="${src}?file=${encodeURIComponent(fileName)}">`;
      }
    }
  );

  // === 4. Inject console override BEFORE any scripts
  const consoleScript = `
    <script>
      (function() {
        try {
          const parentConsole = window.parent.document.getElementById('consoleOutput');
          if (!parentConsole) return;

          function appendMessage(type, prefix, args) {
            try {
              const line = document.createElement('div');
              line.className = type;
              line.textContent = prefix + args.map(arg => {
                if (typeof arg === 'object' && arg !== null) {
                  try {
                    return JSON.stringify(arg, null, 2);
                  } catch (e) {
                    return String(arg);
                  }
                }
                return String(arg);
              }).join(' ');
              parentConsole.appendChild(line);
              parentConsole.scrollTop = parentConsole.scrollHeight;
            } catch (e) {
              // Silently fail if parent access is blocked
            }
          }

          // Override console methods IMMEDIATELY
          console.log = function(...args) { appendMessage('log', '> ', args); };
          console.warn = function(...args) { appendMessage('warn', 'WARNING: ', args); };
          console.error = function(...args) { appendMessage('error', 'ERROR: ', args); };
          console.info = function(...args) { appendMessage('info', 'INFO: ', args); };

          // Capture runtime errors
          window.onerror = function(msg, source, line, col, error) {
            // Extract filename from source if available
            let filename = 'unknown';
            const scripts = document.querySelectorAll('script[data-filename]');
            scripts.forEach(script => {
              if (source && source.includes('blob:')) {
                filename = script.getAttribute('data-filename') || 'inline script';
              }
            });
            
            appendMessage('error', 'Error: ', ['[' + filename + '] ' + msg]);
            return false;
          };

          // Capture unhandled promise rejections
          window.addEventListener('unhandledrejection', function(e) {
            appendMessage('error', 'Promise rejected: ', [e.reason]);
          });

          // Capture resource load errors
          document.addEventListener('error', function(e) {
            const target = e.target;
            if (['IMG', 'LINK', 'SCRIPT', 'VIDEO', 'AUDIO'].includes(target.tagName)) {
              const src = target.src || target.href;
              if (src) {
                try {
                  const url = new URL(src, location.href);
                  const file = url.searchParams.get('file');
                  if (file) {
                    appendMessage('error', 'File not found: ', [decodeURIComponent(file)]);
                  }
                } catch (err) {
                  // Invalid URL
                }
              }
            }
          }, true);
        } catch (e) {
          // Cross-origin or parent access denied
        }
      })();
    </script>`;

  // Insert console script at the very beginning (BEFORE any other scripts)
  if (/<head[^>]*>/i.test(html)) {
    html = html.replace(/(<head[^>]*>)/i, `$1${consoleScript}`);
  } else if (/<html[^>]*>/i.test(html)) {
    html = html.replace(/(<html[^>]*>)/i, `$1${consoleScript}`);
  } else if (/<body[^>]*>/i.test(html)) {
    html = html.replace(/(<body[^>]*>)/i, `${consoleScript}$1`);
  } else {
    // No proper HTML structure, prepend it
    html = consoleScript + html;
  }

  iframe.srcdoc = html;
}

// Helper: Append message to console (for editor-side warnings)
function appendConsoleMessage(type, message) {
  const line = document.createElement("div");
  line.className = type;
  line.textContent = message;
  consoleOutput.appendChild(line);
  consoleOutput.scrollTop = consoleOutput.scrollHeight;
}

// Line numbers
function updateLineNumbers(textarea) {
  if (!textarea) textarea = document.getElementById("activeEditor");
  if (!textarea) return;
  const lines = textarea.value.split("\n").length;
  lineNumbers.textContent = Array.from({ length: lines }, (_, i) => i + 1).join(
    "\n"
  );
}

// Sync scroll
function syncScroll(textarea) {
  if (!textarea) return;
  textarea.addEventListener("scroll", () => {
    lineNumbers.scrollTop = textarea.scrollTop;
  });
}

// PART 6: EDITOR INITIALIZATION (MODIFIED)
function initializeEditor() {
  const editor = document.getElementById("activeEditor");
  editor.value = activeFile.content;
  updateLineNumbers(editor);
  syncScroll(editor);

  // MODIFIED: Combined input listener
  editor.addEventListener("input", (e) => {
    hasUnsavedChanges = true;
    activeFile.content = editor.value;
    updateLineNumbers(editor);
    if (autoRunCheckbox.checked) debouncedUpdatePreview();
    handleCodeChange({
      target: { id: activeFile.type + "Code", value: editor.value },
    });
    announceTyping(activeFile.type + "Code");

    // ADDED: Handle suggestions
    handleSuggestions(e);
  });

  // MODIFIED: Replaced Tab logic with comprehensive keydown handler
  editor.addEventListener("keydown", handleEditorKeyDown);
}

/**
 * Handles the editor's 'input' event to show/hide suggestions.
 */
function handleSuggestions(e) {
  if (activeFile.type !== "html") {
    suggestionPopup.style.display = "none";
    return;
  }

  const editor = e.target;
  const pos = editor.selectionStart;
  const textBefore = editor.value.substring(0, pos);

  // Regex: Check if cursor is right after <tagprefix
  const triggerMatch = textBefore.match(/<([a-zA-Z0-9]*)$/);

  if (triggerMatch) {
    const prefix = triggerMatch[1];
    const suggestions = htmlTags.filter((tag) => tag.startsWith(prefix));

    if (suggestions.length > 0) {
      showSuggestions(suggestions, prefix);
    } else {
      suggestionPopup.style.display = "none";
    }
  } else {
    suggestionPopup.style.display = "none";
  }
}

/**
 * Displays the suggestion popup with filtered tags.
 */
function showSuggestions(suggestions, prefix) {
  suggestionPopup.innerHTML = "";
  suggestions.forEach((tag, index) => {
    const item = document.createElement("div");
    item.className = "suggestion-item";
    // Highlight the part that was typed
    item.innerHTML = `<strong>${tag.substring(
      0,
      prefix.length
    )}</strong>${tag.substring(prefix.length)}`;
    item.dataset.tag = tag;
    // Use mousedown instead of click to fire before blur
    item.addEventListener("mousedown", (e) => {
      e.preventDefault();
      selectSuggestion(tag);
    });
    suggestionPopup.appendChild(item);
  });
  suggestionPopup.style.display = "block";
  activeSuggestion = -1; // Reset active suggestion
}

/**
 * Inserts the selected suggestion into the editor.
 */
function selectSuggestion(tag) {
  const editor = document.getElementById("activeEditor");
  const pos = editor.selectionStart;
  const textBefore = editor.value.substring(0, pos);

  // Find the trigger point again
  const triggerMatch = textBefore.match(/<([a-zA-Z0-9]*)$/);

  if (triggerMatch) {
    const prefix = triggerMatch[1];
    const textBeforeTrigger = textBefore.substring(
      0,
      textBefore.length - prefix.length
    );
    const textAfter = editor.value.substring(editor.selectionEnd);

    const openingTag = `${tag}>`;
    const closingTag = selfClosingTags.includes(tag) ? "" : `</${tag}>`;

    editor.value = textBeforeTrigger + openingTag + closingTag + textAfter;

    // Place cursor inside the tags (or after if self-closing)
    editor.selectionStart = editor.selectionEnd =
      textBeforeTrigger.length + openingTag.length;

    // Hide popup and update state
    suggestionPopup.style.display = "none";
    activeFile.content = editor.value;
    updateLineNumbers(editor);
    if (autoRunCheckbox.checked) debouncedUpdatePreview();
    handleCodeChange();
    editor.focus();
  }
}

/**
 * Highlights the active suggestion item during keyboard navigation.
 */
function updateSuggestionHighlight(items) {
  items.forEach((item, index) => {
    if (index === activeSuggestion) {
      item.classList.add("active");
      // Ensure the active item is visible
      item.scrollIntoView({ block: "nearest" });
    } else {
      item.classList.remove("active");
    }
  });
}

// PART 6.7: AUTO-CLOSING & INDENTATION LOGIC (NEW UTILITY)

/**
 * Handles auto-closing of brackets/parentheses and indentation on 'Enter'.
 * This is specific for CSS and JS files.
 */
function handleAutoCloseAndIndent(e, editor) {
  const fileType = activeFile.type;
  const pos = editor.selectionStart;
  const textBefore = editor.value.substring(0, pos);
  const textAfter = editor.value.substring(pos);

  // 1. Indent level calculation (Find the indentation of the current line)
  const lineStart = textBefore.lastIndexOf("\n") + 1;
  const currentLine = textBefore.substring(lineStart);
  const currentIndentMatch = currentLine.match(/^(\s*)/);
  const currentIndent = currentIndentMatch ? currentIndentMatch[1] : "";

  // 2. Check for an immediate auto-close/indent trigger
  let autoClosePair = null; // Stores { or (
  let isTriggered = false;
  let closingChar = "";
  let insertNewlines = 1;

  if (fileType === "css" || fileType === "js") {
    // Check for { (CSS blocks or JS objects/functions)
    if (e.key === "{") {
      autoClosePair = "{";
      closingChar = "}";
    }
    // Check for ( (JS function calls or definitions)
    else if (fileType === "js" && e.key === "(") {
      autoClosePair = "(";
      closingChar = ")";
    }
    // Check for Enter key press on an opening brace/parenthesis
    else if (
      (e.key === "Enter" &&
        (textBefore.endsWith("{") || textBefore.endsWith("(")) &&
        textAfter.startsWith("}")) ||
      textAfter.startsWith(")")
    ) {
      // User is inside a pair like {} or () and hits Enter
      isTriggered = true;
      insertNewlines = 2; // Insert two newlines to create space for content
      // Find the appropriate closing character based on what's before/after
      if (textBefore.endsWith("{") && textAfter.startsWith("}"))
        closingChar = "}";
      if (textBefore.endsWith("(") && textAfter.startsWith(")"))
        closingChar = ")";
    }
  }

  // --- A. Handle typing an opening bracket/parenthesis ({ or () ---
  if (autoClosePair) {
    e.preventDefault(); // Stop default { or ( insertion

    const newIndent = currentIndent;
    const newText = textBefore + autoClosePair + closingChar + textAfter;
    editor.value = newText;

    // Move cursor before the inserted closing character
    editor.selectionStart = editor.selectionEnd = pos + 1;

    // Update state
    activeFile.content = editor.value;
    updateLineNumbers(editor);
    if (autoRunCheckbox.checked) debouncedUpdatePreview();
    handleCodeChange();

    return true; // Handled
  }

  // --- B. Handle Enter key press for indentation ---
  if (e.key === "Enter") {
    e.preventDefault(); // Stop default new line insertion

    let newContent;
    let newCursorPos;
    let indentation = currentIndent;

    if (textBefore.endsWith("{") || textBefore.endsWith("(") || isTriggered) {
      // We need to increase indentation for the next line
      const nextIndent = currentIndent + "  "; // 2 spaces for indentation

      if (textBefore.endsWith("{") || textBefore.endsWith("(")) {
        // Case 1: Cursor immediately after { or (

        // --- 💡 MODIFICATION START ---
        const autoClosingBracket = textBefore.endsWith("{") ? "}" : ")";

        // Check if the corresponding closing bracket already exists right after the cursor
        const closingExists = textAfter.startsWith(autoClosingBracket);

        if (closingExists) {
          // Scenario: { | } -> Newline + Indent + Newline + CurrentIndent + }
          // This is essentially the same logic as 'isTriggered' but applied to the {|} case
          newContent =
            textBefore + "\n" + nextIndent + "\n" + currentIndent + textAfter;
          newCursorPos = pos + 1 + nextIndent.length; // Pos + \n + newIndent
        } else {
          // Scenario: { | -> Newline + Indent + Newline + CurrentIndent + autoClosingBracket
          // Insert: \n  \n}
          newContent =
            textBefore +
            "\n" +
            nextIndent +
            "\n" +
            currentIndent +
            autoClosingBracket +
            textAfter;
          newCursorPos = pos + 1 + nextIndent.length; // Pos + \n + newIndent
        }
        // --- 💡 MODIFICATION END ---
      } else if (isTriggered) {
        // Case 2: Cursor inside {} or () where Enter was pressed (e.g., body{ | } )
        // Insert: \n  \n
        newContent =
          textBefore + "\n" + nextIndent + "\n" + currentIndent + textAfter;
        newCursorPos = pos + 1 + nextIndent.length; // Pos + \n + newIndent
      }
    } else {
      // Case 3: Simple Enter press - just maintain current indentation
      newContent = textBefore + "\n" + currentIndent + textAfter;
      newCursorPos = pos + 1 + currentIndent.length;
    }

    // ... (rest of the Enter handler code) ...
    editor.value = newContent;
    editor.selectionStart = editor.selectionEnd = newCursorPos;

    // Update state
    activeFile.content = editor.value;
    updateLineNumbers(editor);
    if (autoRunCheckbox.checked) debouncedUpdatePreview();
    handleCodeChange();

    return true; // Handled
  }

  return false; // Not handled
}

// PART 6.5: TAG SUGGESTIONS & AUTO-CLOSING LOGIC (UPDATED)

/**
 * Handles auto-closing of HTML tags when '>' is typed. (Original logic remains)
 */
function handleTagClosing(e) {
  // ... (Keep the original logic here) ...
  if (e.key !== ">") return;
  if (activeFile.type !== "html") return;

  const editor = e.target;
  const pos = editor.selectionStart;
  const textBefore = editor.value.substring(0, pos);

  const tagMatch = textBefore.match(/<([a-zA-Z0-9]+)(?![^>]*\/?>)\s*$/);

  if (tagMatch) {
    const tagName = tagMatch[1];
    if (selfClosingTags.includes(tagName.toLowerCase())) {
      return;
    }

    e.preventDefault();
    const closingTag = `</${tagName}>`;
    const textAfter = editor.value.substring(editor.selectionEnd);

    editor.value = textBefore + ">" + closingTag + textAfter;

    editor.selectionStart = editor.selectionEnd = pos + 1;

    activeFile.content = editor.value;
    updateLineNumbers(editor);
    if (autoRunCheckbox.checked) debouncedUpdatePreview();
    handleCodeChange();
  }
}

/**
 * Handles all keydown events in the editor for suggestions, tab, and auto-closing. (REVISED)
 */
function handleEditorKeyDown(e) {
  const editor = e.target;

  // --- 1. Suggestion Popup Navigation (HTML only) ---
  if (suggestionPopup.style.display === "block") {
    const items = suggestionPopup.querySelectorAll(".suggestion-item");
    if (!items.length) {
      // If popup is open but empty, still allow Enter/Tab for default action
      if (e.key === "Enter" || e.key === "Tab") {
        suggestionPopup.style.display = "none";
        if (e.key === "Tab") e.preventDefault(); // Prevent tabbing out
      }
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      activeSuggestion = (activeSuggestion + 1) % items.length;
      updateSuggestionHighlight(items);
      return;
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      activeSuggestion = (activeSuggestion - 1 + items.length) % items.length;
      updateSuggestionHighlight(items);
      return;
    } else if (e.key === "Enter" || e.key === "Tab") {
      if (activeSuggestion > -1) {
        // Select the highlighted suggestion
        e.preventDefault();
        selectSuggestion(items[activeSuggestion].dataset.tag);
        return;
      } else {
        // Allow default behavior if no suggestion is active
        suggestionPopup.style.display = "none";
        if (e.key === "Tab") e.preventDefault(); // Prevent tabbing out
      }
    } else if (e.key === "Escape") {
      e.preventDefault();
      suggestionPopup.style.display = "none";
      return;
    } else if (e.key === ">") {
      // Handle tag closing, then hide popup
      handleTagClosing(e);
      suggestionPopup.style.display = "none";
      return;
    }
  }

  // --- 2. Auto-Closing & Indentation (CSS and JS) ---
  if (activeFile.type === "css" || activeFile.type === "js") {
    if (handleAutoCloseAndIndent(e, editor)) {
      return; // If auto-closing/indentation was handled, stop here
    }
  }

  // --- 3. HTML Tag Closing (If popup was not visible) ---
  if (activeFile.type === "html" && e.key === ">") {
    handleTagClosing(e);
    return;
  }

  // --- 4. Tab for Indentation (Fallback for all file types) ---
  if (e.key === "Tab") {
    e.preventDefault();
    const start = editor.selectionStart;
    const end = editor.selectionEnd;
    // Insert 2 spaces
    editor.value =
      editor.value.substring(0, start) + "  " + editor.value.substring(end);
    editor.selectionStart = editor.selectionEnd = start + 2;

    // Update state
    activeFile.content = editor.value;
    updateLineNumbers(editor);
    if (autoRunCheckbox.checked) debouncedUpdatePreview();
    handleCodeChange({
      target: { id: activeFile.type + "Code", value: editor.value },
    });
    return;
  }

  // All other keys fall through to default behavior
}

// PART 7: KEYBOARD SHORTCUTS
document.addEventListener("keydown", (e) => {
  // Prevent shortcuts from firing while suggestion box is open
  if (suggestionPopup.style.display === "block") {
    if (e.ctrlKey && (e.key === "s" || e.key === "Enter" || e.key === "n")) {
      e.preventDefault();
    }
    return;
  }

  if (e.ctrlKey && e.key === "s") {
    e.preventDefault();
    exportAsZip();
  }
  if (e.ctrlKey && e.key === "Enter") {
    e.preventDefault();
    updatePreview();
  }
  if (e.ctrlKey && e.key === "n") {
    e.preventDefault();
    createNewFile();
  }
  if (e.ctrlKey && e.shiftKey && e.key === "C") {
    e.preventDefault();
    showConsoleCheckbox.checked = !showConsoleCheckbox.checked;
    showConsoleCheckbox.dispatchEvent(new Event("change"));
  }
});

// PART 8: DRAG & DROP
["dragover", "dragleave", "drop"].forEach((eventName) => {
  editorContainer.addEventListener(eventName, (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (eventName === "dragover") editorContainer.classList.add("dragover");
    if (eventName === "dragleave" || eventName === "drop")
      editorContainer.classList.remove("dragover");
  });
});

editorContainer.addEventListener("drop", (e) => {
  for (const file of e.dataTransfer.files) {
    const reader = new FileReader();
    reader.onload = (ev) => {
      const content = ev.target.result;
      const ext = file.name.split(".").pop().toLowerCase();
      if (["html", "css", "js"].includes(ext)) {
        if (projectFiles.some((f) => f.name === file.name)) {
          showNotification(`File ${file.name} already exists`, "error");
          return;
        }
        const newFile = { name: file.name, type: ext, content, active: false };
        projectFiles.push(newFile);
        if (projectFiles.length === 1) {
          newFile.active = true;
          activeFile = newFile;
          document.getElementById("activeEditor").value = content;
          updateLineNumbers();
        }
        renderFileList();
        syncProjectWithSession();
        showNotification(`Imported: ${file.name}`, "success");
      }
    };
    reader.readAsText(file);
  }
});

// PART 9: ZIP EXPORT
async function exportAsZip() {
  const zip = new JSZip();
  projectFiles.forEach((file) => {
    zip.file(file.name, file.content);
  });
  try {
    const content = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(content);
    const a = document.createElement("a");
    a.href = url;
    a.download = "codx-project.zip";
    a.click();
    URL.revokeObjectURL(url);
    showNotification("Project exported as ZIP!", "success");
  } catch (err) {
    console.error("Export error:", err);
    showNotification("Error creating ZIP file", "error");
  }
}

// PART 10: ZIP IMPORT
function importZip() {
  document.getElementById("zipFileInput").click();
}

function handleZipImport(event) {
  const file = event.target.files[0];
  if (!file) return;

  if (!file.name.endsWith(".zip")) {
    showNotification("Please select a valid ZIP file", "error");
    return;
  }

  JSZip.loadAsync(file)
    .then((zip) => {
      const promises = [];
      projectFiles = [];
      const foundFiles = [];

      zip.forEach((path, entry) => {
        const ext = path.split(".").pop().toLowerCase();
        if (["html", "css", "js"].includes(ext) && !entry.dir) {
          foundFiles.push(path);
          promises.push(
            entry.async("string").then((content) => {
              projectFiles.push({
                name: path,
                type: ext,
                content,
                active: false,
              });
            })
          );
        }
      });

      Promise.all(promises).then(() => {
        if (projectFiles.length === 0) {
          showNotification("No valid files found in ZIP", "error");
          return;
        }
        projectFiles[0].active = true;
        activeFile = projectFiles[0];
        const editor = document.getElementById("activeEditor");
        editor.value = activeFile.content;
        updateLineNumbers(editor);
        renderFileList();
        if (autoRunCheckbox.checked) updatePreview();
        syncProjectWithSession();
        showNotification(
          `Project imported! Files: ${foundFiles.join(", ")}`,
          "success"
        );
      });
    })
    .catch((err) => {
      console.error("Import error:", err);
      showNotification("Error reading ZIP file.", "error");
    });
  event.target.value = "";
}

// PART 11: FULLSCREEN
previewFullscreenBtn.addEventListener("click", togglePreviewFullscreen);
document.addEventListener("fullscreenchange", updateFullscreenButtonState);

function togglePreviewFullscreen() {
  if (!document.fullscreenElement) {
    if (previewIframe.requestFullscreen) {
      previewIframe.requestFullscreen();
    } else if (previewIframe.webkitRequestFullscreen) {
      previewIframe.webkitRequestFullscreen();
    } else if (previewIframe.msRequestFullscreen) {
      previewIframe.msRequestFullscreen();
    }
  } else {
    document.exitFullscreen();
  }
}

function updateFullscreenButtonState() {
  if (document.fullscreenElement === previewIframe) {
    previewFullscreenBtn.innerHTML = `
      <svg class="btn-icon" viewBox="0 0 24 24">
        <path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z"/>
      </svg>
      <strong>EXIT FULLSCREEN</strong>
    `;
  } else {
    previewFullscreenBtn.innerHTML = `
      <svg class="btn-icon" viewBox="0 0 24 24">
        <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/>
      </svg>
      <strong>FULLSCREEN</strong>
    `;
  }
}

// PART 12: COLLABORATION FEATURES (NUMERIC-ONLY SESSION IDs)
closeModalBtn.addEventListener("click", closeModal);
collabBtn.addEventListener("click", startCollaboration);
window.addEventListener("load", checkForSession);
window.addEventListener("storage", handleStorageChange);

// ---- 1. Generate a numeric-only unique ID ----
function generateNumericSessionId() {
  const ts = Date.now(); // 13-digit timestamp
  const rnd = Math.floor(Math.random() * 1000); // 0-999
  return `${ts}${rnd}`; // e.g. 17234567890123
}

// ---- 2. Typing indicator (unchanged) ----
function announceTyping(activeEditorId) {
  if (!myInfo.name) return;
  clearTimeout(typingTimer);
  const sessionId = safeLocalStorage("get", "activeSessionId");
  if (!sessionId) return;

  let session;
  try {
    const s = safeLocalStorage("get", sessionId);
    session = s ? JSON.parse(s) : null;
  } catch {
    return;
  }

  if (session) {
    session.typingIndicator = {
      name: myInfo.name,
      theme: myInfo.theme,
      editor: activeEditorId,
    };
    safeLocalStorage("set", sessionId, JSON.stringify(session));
  }

  typingTimer = setTimeout(() => {
    try {
      const s = safeLocalStorage("get", sessionId);
      if (s) {
        const sess = JSON.parse(s);
        sess.typingIndicator = null;
        safeLocalStorage("set", sessionId, JSON.stringify(sess));
      }
    } catch {}
  }, 1500);
}

function updateTypingIndicatorUI(ind) {
  const ed = document.getElementById("activeEditor");
  ed.style.boxShadow = "none";
  if (
    ind &&
    ind.name !== myInfo.name &&
    ind.editor === activeFile.type + "Code"
  ) {
    ed.style.boxShadow = `0 0 0 3px ${ind.theme} inset`;
    typingIndicatorEl.textContent = `${ind.name} is typing...`;
    typingIndicatorEl.style.backgroundColor = ind.theme;
    typingIndicatorEl.style.display = "block";
  } else {
    typingIndicatorEl.style.display = "none";
  }
}

// ---- 3. Username validation (unchanged) ----
function validateUsername(u) {
  if (!u || !u.trim()) return { valid: false, error: "Enter a name." };
  if (u.length < 2) return { valid: false, error: "At least 2 characters." };
  if (u.length > 20) return { valid: false, error: "Max 20 characters." };
  if (!/^[a-zA-Z0-9\s_-]+$/.test(u))
    return { valid: false, error: "Only letters, numbers, space, _ , -." };
  return { valid: true };
}

// ---- 4. Start a new session (host) ----
function startCollaboration() {
  const sid = safeLocalStorage("get", "activeSessionId");
  const data = sid ? safeLocalStorage("get", sid) : null;

  // Already in a session → show details
  if (data && myInfo.name) {
    showSessionDetails(sid);
    return;
  }

  // Fresh session
  modalTitle.innerHTML = "<strong>START COLLAB</strong>";
  modalBody.innerHTML =
    '<p><strong>Your name:</strong></p><input type="text" id="userNameInput" placeholder="Name" style="width:80%;padding:8px;" maxlength="20">';
  collabModal.style.display = "flex";
  errorMsgEl.style.display = "none";

  modalDoneBtn.onclick = () => {
    const name = document.getElementById("userNameInput").value.trim();
    const v = validateUsername(name);
    if (!v.valid) {
      errorMsgEl.textContent = v.error;
      errorMsgEl.style.display = "block";
      return;
    }
    errorMsgEl.style.display = "none";
    sessionData.host = name;
    promptForTheme();
  };
}

function promptForTheme() {
  modalTitle.innerHTML = "<strong>PICK COLOR</strong>";
  modalBody.innerHTML = `<p><strong>Your color:</strong></p><input type="color" id="userThemeInput" value="#4CAF50">`;
  errorMsgEl.style.display = "none";

  modalDoneBtn.onclick = () => {
    sessionData.theme = document.getElementById("userThemeInput").value;
    createNumericSession();
  };
}

function createNumericSession() {
  const sid = generateNumericSessionId(); // numeric only
  const link = window.location.href.split("#")[0] + "#" + sid;

  const init = {
    id: sid,
    files: projectFiles,
    participants: [{ name: sessionData.host, theme: sessionData.theme }],
  };

  if (!safeLocalStorage("set", sid, JSON.stringify(init))) {
    showNotification("Storage full – cannot create session", "error");
    return;
  }

  safeLocalStorage("set", "activeSessionId", sid);
  myInfo = { name: sessionData.host, theme: sessionData.theme };

  modalTitle.innerHTML = "<strong>SHARE LINK</strong>";
  modalBody.innerHTML = `<input type="text" readonly id="collabLinkInput" value="${link}" style="width:90%;padding:8px;text-align:center;">`;
  document.getElementById("modalActions").innerHTML = `
    <button class="run-button" onclick="copyLink()"><strong>COPY</strong></button>
    <button class="run-button" onclick="closeModal()"><strong>DONE</strong></button>`;
  startSyncing();
}

// ---- 5. Show existing session details (for host or participants) ----
function showSessionDetails(sid) {
  const data = safeLocalStorage("get", sid);
  if (!data) return;

  const sess = JSON.parse(data);
  const link = window.location.href.split("#")[0] + "#" + sid;

  modalTitle.innerHTML = "<strong>SESSION INFO</strong>";
  let list =
    '<h4>Participants:</h4><ul style="list-style:none;padding:0;text-align:left;">';
  sess.participants.forEach((p) => {
    list += `<li style="padding:5px;"><span style="display:inline-block;width:12px;height:12px;border-radius:50%;background:${p.theme};margin-right:8px;"></span>${p.name}</li>`;
  });
  list += "</ul>";

  modalBody.innerHTML = `
    <p><strong>Share:</strong></p>
    <input type="text" readonly id="collabLinkInput" value="${link}" style="width:90%;padding:8px;text-align:center;">
    <hr style="border-color:var(--border-color);margin:15px 0;">
    ${list}
  `;

  document.getElementById("modalActions").innerHTML = `
    <button class="run-button" onclick="copyLink()"><strong>COPY LINK</strong></button>
    <button class="run-button" onclick="closeModal()"><strong>CLOSE</strong></button>`;
  collabModal.style.display = "flex";
}

// ---- 6. Copy link helper ----
function copyLink() {
  const el = document.getElementById("collabLinkInput");
  el.select();
  el.setSelectionRange(0, 99999);
  try {
    document.execCommand("copy");
    showNotification("Copied!", "success");
  } catch {
    navigator.clipboard
      .writeText(el.value)
      .then(() => showNotification("Copied!", "success"));
  }
}

// ---- 7. Close modal (reset button) ----
function closeModal() {
  collabModal.style.display = "none";
  document.getElementById(
    "modalActions"
  ).innerHTML = `<button id="modalDoneBtn" class="run-button"><strong>DONE</strong></button>`;
}

// ---- 8. Check URL hash on load (join or error) ----
function checkForSession() {
  const hash = window.location.hash.substring(1);
  if (!/^\d+$/.test(hash)) return; // only digits allowed

  const stored = safeLocalStorage("get", hash);
  if (!stored) {
    // ---- INVALID / EXPIRED LINK ----
    modalTitle.innerHTML = "<strong>SESSION NOT FOUND</strong>";
    modalBody.innerHTML = `
      <p style="color:#ff5555;"><strong>This link is invalid or the session has expired.</strong></p>
      <p>Ask the host for a new link.</p>`;
    document.getElementById("modalActions").innerHTML = `
      <button class="run-button" onclick="closeModal()" style="background:#ff5555;"><strong>CLOSE</strong></button>`;
    collabModal.style.display = "flex";
    return;
  }

  safeLocalStorage("set", "activeSessionId", hash);
  modalTitle.innerHTML = "<strong>JOIN SESSION</strong>";
  modalBody.innerHTML =
    '<p><strong>Your name:</strong></p><input type="text" id="userNameInput" placeholder="Name" style="width:80%;padding:8px;" maxlength="20">';
  collabModal.style.display = "flex";
  errorMsgEl.style.display = "none";

  modalDoneBtn.onclick = () => {
    const name = document.getElementById("userNameInput").value.trim();
    const v = validateUsername(name);
    if (!v.valid) {
      errorMsgEl.textContent = v.error;
      errorMsgEl.style.display = "block";
      return;
    }

    const sess = JSON.parse(stored);
    const taken = sess.participants.some(
      (p) => p.name.toLowerCase() === name.toLowerCase()
    );
    if (taken) {
      errorMsgEl.textContent = "Name already taken.";
      errorMsgEl.style.display = "block";
      return;
    }

    errorMsgEl.style.display = "none";
    promptJoinTheme(name, hash);
  };
}

// ---- 9. Choose color & join ----
function promptJoinTheme(name, sid) {
  modalTitle.innerHTML = "<strong>PICK COLOR</strong>";
  modalBody.innerHTML = `<p><strong>Your color:</strong></p><input type="color" id="userThemeInput" value="#2196F3">`;
  errorMsgEl.style.display = "none";

  modalDoneBtn.onclick = () => {
    const theme = document.getElementById("userThemeInput").value;
    const data = safeLocalStorage("get", sid);
    if (!data) {
      showNotification("Session gone.", "error");
      closeModal();
      return;
    }

    myInfo = { name, theme };
    const sess = JSON.parse(data);
    sess.participants.push({ name, theme });
    projectFiles = sess.files;
    activeFile = projectFiles.find((f) => f.active) || projectFiles[0];
    projectFiles.forEach((f) => (f.active = f === activeFile));

    const ed = document.getElementById("activeEditor");
    ed.value = activeFile.content;
    updateLineNumbers(ed);
    renderFileList();
    updatePreview();
    safeLocalStorage("set", sid, JSON.stringify(sess));

    showNotification(`Welcome, ${name}!`, "success");
    startSyncing();
    closeModal();
  };
}

// ---- 10. Sync helpers (unchanged) ----
function handleCodeChange() {
  const sid = safeLocalStorage("get", "activeSessionId");
  if (!sid) return;
  const s = safeLocalStorage("get", sid);
  if (!s) return;
  try {
    const sess = JSON.parse(s);
    sess.files = projectFiles;
    safeLocalStorage("set", sid, JSON.stringify(sess));
  } catch (e) {
    console.error("sync err", e);
  }
}

function syncProjectWithSession() {
  const sid = safeLocalStorage("get", "activeSessionId");
  if (!sid) return;
  const s = safeLocalStorage("get", sid);
  if (!s) return;
  try {
    const sess = JSON.parse(s);
    sess.files = projectFiles;
    safeLocalStorage("set", sid, JSON.stringify(sess));
  } catch (e) {
    console.error("sync err", e);
  }
}

function startSyncing() {
  const ed = document.getElementById("activeEditor");
  // The 'input' listener in initializeEditor already calls handleCodeChange
  // and announceTyping, so no need to add duplicate listeners.
}

function handleStorageChange(e) {
  const sid = safeLocalStorage("get", "activeSessionId");

  // Only sync if we're in a collaboration session
  if (!sid || !myInfo.name) {
    // Not in collab mode, don't sync between tabs
    return;
  }

  if (e.key === sid && e.newValue) {
    try {
      const nv = JSON.parse(e.newValue);
      if (JSON.stringify(projectFiles) !== JSON.stringify(nv.files)) {
        projectFiles = nv.files;
        activeFile = projectFiles.find((f) => f.active) || projectFiles[0];
        projectFiles.forEach((f) => (f.active = f === activeFile));

        const ed = document.getElementById("activeEditor");
        const currentPos = ed.selectionStart;
        ed.value = activeFile.content;
        ed.selectionStart = ed.selectionEnd = currentPos;

        updateLineNumbers(ed);
        renderFileList();
        if (autoRunCheckbox.checked) updatePreview();
      }
      updateTypingIndicatorUI(nv.typingIndicator);
    } catch (er) {
      console.error("storage sync err", er);
    }
  }
}

// 10: MEDIA FILE HANDLER
const addMediaBtn = document.getElementById("addMediaBtn");
const mediaInput = document.createElement("input");
mediaInput.type = "file";
mediaInput.accept = "image/*,video/mp4,audio/mp3";
mediaInput.multiple = true;
mediaInput.style.display = "none";
document.body.appendChild(mediaInput);

addMediaBtn.addEventListener("click", () => mediaInput.click());

mediaInput.addEventListener("change", (e) => {
  const files = Array.from(e.target.files);
  if (!files.length) return;

  files.forEach((file) => {
    const reader = new FileReader();
    reader.onload = (ev) => {
      const base64 = ev.target.result;
      const name = file.name;
      const ext = name.split(".").pop().toLowerCase();
      const type = ["jpg", "jpeg", "png", "gif", "webp"].includes(ext)
        ? "img"
        : ext === "mp4"
        ? "video"
        : "audio";

      const newFile = {
        name,
        type: "media",
        mediaType: type,
        content: base64,
        active: false,
      };

      if (!projectFiles.some((f) => f.name === name)) {
        projectFiles.push(newFile);
        showNotification(`Added: ${name}`, "success");
      } else {
        showNotification(`${name} already exists`, "warn");
      }
      renderFileList();
      syncProjectWithSession();
    };
    reader.readAsDataURL(file);
  });
  mediaInput.value = "";
});

// 11 === SEAMLESS & FULL-RANGE DIVIDER DRAG ===
let isDragging = false;
let startX, startEditorWidth, containerWidth;

divider.addEventListener("mousedown", startDragging);
divider.addEventListener("touchstart", startDragging, { passive: true });

function startDragging(e) {
  isDragging = true;
  divider.classList.add("dragging");
  document.body.style.cursor = "col-resize";
  document.body.style.userSelect = "none";

  startX = e.type.includes("mouse") ? e.pageX : e.touches[0].pageX;
  startEditorWidth = editorsPanel.getBoundingClientRect().width;
  containerWidth = editorContainer.getBoundingClientRect().width; // Full container

  e.preventDefault();

  document.addEventListener("mousemove", doDrag);
  document.addEventListener("touchmove", doDrag, { passive: false });
  document.addEventListener("mouseup", stopDragging);
  document.addEventListener("touchend", stopDragging);
}

function doDrag(e) {
  if (!isDragging) return;

  const currentX = e.type.includes("mouse") ? e.pageX : e.touches[0].pageX;
  const diff = currentX - startX;
  let newWidth = startEditorWidth + diff;

  // === MIN / MAX BOUNDS ===
  const minWidth = 200;
  const maxWidth = containerWidth - 100; // Leave 100px for preview
  newWidth = Math.max(minWidth, Math.min(newWidth, maxWidth));

  // Apply instantly
  editorsPanel.style.width = `${newWidth}px`;
  editorsPanel.style.flex = "none"; // Prevent flex from overriding

  if (e.type === "touchmove") e.preventDefault();
}

function stopDragging() {
  if (!isDragging) return;
  isDragging = false;
  divider.classList.remove("dragging");
  document.body.style.cursor = "";
  document.body.style.userSelect = "";

  // Restore flex after drag (optional smooth reset)
  editorsPanel.style.flex = "";
  editorsPanel.style.maxWidth = "80%";

  document.removeEventListener("mousemove", doDrag);
  document.removeEventListener("touchmove", doDrag);
  document.removeEventListener("mouseup", stopDragging);
  document.removeEventListener("touchend", stopDragging);
}

// Reset on window resize
window.addEventListener("resize", () => {
  if (!isDragging) {
    const current = editorsPanel.getBoundingClientRect().width;
    const max = window.innerWidth * 0.8;
    if (current > max) {
      editorsPanel.style.width = "50%";
    }
  }
});

// PART 12: INITIALIZATION
window.addEventListener("load", () => {
  loadSettings();
  renderFileList();
  initializeEditor();
  updatePreview();
});

window.addEventListener("beforeunload", function (e) {
  if (hasUnsavedChanges) {
    e.preventDefault();
    e.returnValue = "";
    return "Are you sure you want to leave? Your changes may not be saved.";
  }
});

newFileBtn.addEventListener("click", createNewFile);

// FONT PICKER
const fontPickerBtn = document.getElementById("fontPickerBtn");
const fontPickerModal = document.getElementById("fontPickerModal");
const closeFontPickerBtn = document.getElementById("closeFontPickerBtn");
const fontGrid = document.getElementById("fontGrid");

const fonts = [
  { name: "Arial", family: "Arial, sans-serif" },
  { name: "Helvetica", family: "Helvetica, sans-serif" },
  { name: "Times New Roman", family: "'Times New Roman', serif" },
  { name: "Georgia", family: "Georgia, serif" },
  { name: "Courier New", family: "'Courier New', monospace" },
  { name: "Verdana", family: "Verdana, sans-serif" },
  { name: "Trebuchet MS", family: "'Trebuchet MS', sans-serif" },
  { name: "Comic Sans MS", family: "'Comic Sans MS', cursive" },
  { name: "Impact", family: "Impact, fantasy" },
  { name: "Lucida Console", family: "'Lucida Console', monospace" },
  { name: "Tahoma", family: "Tahoma, sans-serif" },
  { name: "Palatino", family: "'Palatino Linotype', serif" },
  { name: "Garamond", family: "Garamond, serif" },
  { name: "Bookman", family: "'Bookman Old Style', serif" },
  { name: "Brush Script MT", family: "'Brush Script MT', cursive" },
  { name: "Consolas", family: "Consolas, monospace" },
  { name: "Monaco", family: "Monaco, monospace" },
  { name: "Roboto", family: "'Roboto', sans-serif" },
  { name: "Open Sans", family: "'Open Sans', sans-serif" },
  { name: "Lato", family: "'Lato', sans-serif" },
  { name: "Montserrat", family: "'Montserrat', sans-serif" },
  { name: "Poppins", family: "'Poppins', sans-serif" },
  { name: "Source Sans Pro", family: "'Source Sans Pro', sans-serif" },
  { name: "Raleway", family: "'Raleway', sans-serif" },
  { name: "Ubuntu", family: "'Ubuntu', sans-serif" },
  { name: "Playfair Display", family: "'Playfair Display', serif" },
  { name: "Merriweather", family: "'Merriweather', serif" },
  { name: "Fira Sans", family: "'Fira Sans', sans-serif" },
  { name: "Nunito", family: "'Nunito', sans-serif" },
  { name: "Quicksand", family: "'Quicksand', sans-serif" },
];

function renderFonts() {
  fontGrid.innerHTML = "";
  fonts.forEach((font) => {
    const card = document.createElement("div");
    card.className = "font-card";
    card.innerHTML = `
      <div class="font-name">${font.name}</div>
      <div class="font-preview" style="font-family: ${font.family};">The quick brown fox</div>
      <div class="font-code">${font.family}</div>
    `;
    card.addEventListener("click", () => copyFontCode(font.family, font.name));
    fontGrid.appendChild(card);
  });
}

function copyFontCode(fontFamily, fontName) {
  const code = `font-family: ${fontFamily};`;

  // Try modern clipboard API first
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard
      .writeText(code)
      .then(() => {
        showNotification(`Copied: ${fontName}`, "success");
      })
      .catch(() => {
        fallbackCopy(code, fontName);
      });
  } else {
    fallbackCopy(code, fontName);
  }
}

function fallbackCopy(text, fontName) {
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.select();
  try {
    document.execCommand("copy");
    showNotification(`Copied: ${fontName}`, "success");
  } catch (err) {
    showNotification("Failed to copy", "error");
  }
  document.body.removeChild(textarea);
}

fontPickerBtn.addEventListener("click", () => {
  renderFonts();
  fontPickerModal.style.display = "flex";
});

closeFontPickerBtn.addEventListener("click", () => {
  fontPickerModal.style.display = "none";
});

fontPickerModal.addEventListener("click", (e) => {
  if (e.target === fontPickerModal) {
    fontPickerModal.style.display = "none";
  }
});

// ADD THIS CODE TO THE END OF codx-editor.js (before the final console.log)

// ============ TUTORIAL SYSTEM ============

const tutorialSteps = [
  {
    target: 'label[title="Toggle auto-run feature"]',
    icon: "fa-solid fa-rotate",
    title: "Auto-Run",
    description:
      "When enabled, your code runs automatically as you type. Disable it to run manually with the RUN button.",
    position: "bottom",
  },
  {
    target: 'label[title="Show/hide console output"]',
    icon: "fa-solid fa-terminal",
    title: "Console Toggle",
    description:
      "Show or hide the console output panel. View console.log(), errors, and warnings here.",
    position: "bottom",
  },
  {
    target: "#collabBtn",
    icon: "fa-solid fa-users",
    title: "Collaborate",
    description:
      "Work together with friends in real-time! Share a link and code together.",
    position: "bottom-left",
  },
  {
    target: "#previewFullscreenBtn",
    icon: "fa-solid fa-expand",
    title: "Fullscreen Preview",
    description:
      "View your website in fullscreen mode. Perfect for testing responsive designs.",
    position: "bottom-left",
  },
  {
    target: "#settingsBtn",
    icon: "fa-solid fa-gear",
    title: "Editor Settings",
    description:
      "Customize your editor colors, font size, and font family to match your preferences.",
    position: "bottom-left",
  },
  {
    target: "#addMediaBtn",
    icon: "fa-solid fa-image",
    title: "Add Media",
    description:
      "Upload images, videos, or audio files to use in your project.",
    position: "bottom-left",
  },
  {
    target: "#fontPickerBtn",
    icon: "fa-solid fa-font",
    title: "Font Picker",
    description:
      "Browse and copy professional font-family CSS code for your designs.",
    position: "bottom-left",
  },
  {
    target: 'label[title="Toggle light/dark theme"]',
    icon: "fa-solid fa-moon",
    title: "Theme Toggle",
    description: "Switch between dark and light themes for comfortable coding.",
    position: "bottom-right",
  },
  {
    target: "#newFileBtn",
    icon: "fa-solid fa-plus",
    title: "New File",
    description: "Create new HTML, CSS, or JS files for your project.",
    position: "bottom-right",
  },
  {
    target: "#fileList",
    icon: "fa-solid fa-folder-open",
    title: "File Explorer",
    description:
      "Click files to switch between them. Click the trash icon to delete files.",
    position: "bottom",
  },
  {
    target: "#activeEditor",
    icon: "fa-solid fa-code",
    title: "Code Editor",
    description:
      "Write your code here! Features include:\n• Auto-closing tags (HTML)\n• Auto-closing brackets (CSS/JS)\n• Tag suggestions (type < in HTML)\n• Tab for 2-space indentation\n• Drag & drop files",
    position: "right",
  },
  {
    target: 'button[onclick="updatePreview()"]',
    icon: "fa-solid fa-play",
    title: "Run Button",
    description: "Click to manually run your code and update the preview.",
    position: "top-left",
  },
  {
    target: "#output",
    icon: "fa-solid fa-eye",
    title: "Live Preview",
    description:
      "See your website come to life here! Updates automatically if Auto-Run is enabled.",
    position: "left",
  },
];

let currentStep = 0;
let tutorialActive = false;

// Create tutorial modal HTML
const tutorialModalHTML = `
  <div id="tutorialModal" style="
    display: none;
    position: fixed;
    z-index: 10000;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
  ">
    <div id="tutorialCard" style="
      position: absolute;
      background: var(--bg-secondary);
      border: 2px solid var(--accent-color);
      border-radius: 12px;
      padding: 20px;
      max-width: 350px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
      animation: tutorialFadeIn 0.3s ease;
      pointer-events: auto;
    ">
      <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 15px;">
        <div style="display: flex; align-items: center; gap: 10px; flex: 1;">
          <i id="tutorialIcon" style="color: var(--accent-color); font-size: 20px;"></i>
          <h3 id="tutorialTitle" style="margin: 0; color: var(--accent-color); font-size: 18px;"></h3>
        </div>
        <button id="closeTutorialBtn" style="
          background: none;
          border: none;
          color: var(--text-muted);
          font-size: 24px;
          cursor: pointer;
          line-height: 1;
          padding: 0;
          width: 30px;
          height: 30px;
          flex-shrink: 0;
        " aria-label="Close tutorial">&times;</button>
      </div>
      <p id="tutorialDescription" style="
        color: var(--text-primary);
        line-height: 1.6;
        margin-bottom: 20px;
        white-space: pre-line;
      "></p>
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <span id="tutorialProgress" style="color: var(--text-muted); font-size: 13px;"></span>
        <div style="display: flex; gap: 10px;">
          <button id="tutorialPrevBtn" class="run-button" style="padding: 6px 12px; font-size: 12px;">
            <i class="fa-solid fa-arrow-left"></i> <strong>BACK</strong>
          </button>
          <button id="tutorialNextBtn" class="run-button" style="padding: 6px 12px; font-size: 12px;">
            <strong>NEXT</strong> <i class="fa-solid fa-arrow-right"></i>
          </button>
        </div>
      </div>
    </div>
    <div id="tutorialHighlight" style="
      position: absolute;
      border: 3px solid var(--accent-color);
      border-radius: 8px;
      pointer-events: none;
      background: transparent;
      transition: all 0.3s ease;
      z-index: 9999;
    "></div>
  </div>
`;

// Add tutorial styles
const tutorialStyles = `
  @keyframes tutorialFadeIn {
    from { opacity: 0; transform: scale(0.95); }
    to { opacity: 1; transform: scale(1); }
  }
  
  #closeTutorialBtn:hover {
    color: var(--accent-color) !important;
    transform: rotate(90deg);
    transition: all 0.3s ease;
  }
`;

const tutorialStyleSheet = document.createElement("style");
tutorialStyleSheet.textContent = tutorialStyles;
document.head.appendChild(tutorialStyleSheet);

// Insert tutorial modal into body
document.body.insertAdjacentHTML("beforeend", tutorialModalHTML);

// Get tutorial elements
const tutorialModal = document.getElementById("tutorialModal");
const tutorialCard = document.getElementById("tutorialCard");
const tutorialIcon = document.getElementById("tutorialIcon");
const tutorialTitle = document.getElementById("tutorialTitle");
const tutorialDescription = document.getElementById("tutorialDescription");
const tutorialProgress = document.getElementById("tutorialProgress");
const tutorialHighlight = document.getElementById("tutorialHighlight");
const tutorialNextBtn = document.getElementById("tutorialNextBtn");
const tutorialPrevBtn = document.getElementById("tutorialPrevBtn");
const closeTutorialBtn = document.getElementById("closeTutorialBtn");

// Check if tutorial has been completed
function checkTutorialStatus() {
  const completed = safeLocalStorage("get", "tutorialCompleted");
  if (!completed) {
    // Wait a moment for the page to fully load, then start tutorial
    setTimeout(() => startTutorial(), 500);
  }
}

// Start tutorial
function startTutorial() {
  tutorialActive = true;
  currentStep = 0;
  tutorialModal.style.display = "block";
  showTutorialStep(currentStep);
}

// Show specific tutorial step
function showTutorialStep(stepIndex) {
  if (stepIndex < 0 || stepIndex >= tutorialSteps.length) return;

  const step = tutorialSteps[stepIndex];
  const targetElement = document.querySelector(step.target);

  if (!targetElement) {
    console.warn(`Tutorial target not found: ${step.target}`);
    return;
  }

  // Update content
  tutorialIcon.className = step.icon;
  tutorialTitle.textContent = step.title;
  tutorialDescription.textContent = step.description;
  tutorialProgress.textContent = `Step ${stepIndex + 1} of ${
    tutorialSteps.length
  }`;

  // Update buttons
  tutorialPrevBtn.disabled = stepIndex === 0;
  tutorialPrevBtn.style.opacity = stepIndex === 0 ? "0.5" : "1";

  if (stepIndex === tutorialSteps.length - 1) {
    tutorialNextBtn.innerHTML =
      '<strong>FINISH</strong> <i class="fa-solid fa-check"></i>';
  } else {
    tutorialNextBtn.innerHTML =
      '<strong>NEXT</strong> <i class="fa-solid fa-arrow-right"></i>';
  }

  // Position highlight and card
  positionTutorialElements(targetElement, step.position);
}

// Position tutorial card and highlight
function positionTutorialElements(target, position) {
  const rect = target.getBoundingClientRect();
  const cardRect = tutorialCard.getBoundingClientRect();

  // Position highlight around the target element
  tutorialHighlight.style.left = rect.left - 5 + "px";
  tutorialHighlight.style.top = rect.top - 5 + "px";
  tutorialHighlight.style.width = rect.width + 10 + "px";
  tutorialHighlight.style.height = rect.height + 10 + "px";

  // Position card based on position parameter
  let cardLeft, cardTop;
  const margin = 15;

  switch (position) {
    case "bottom":
      // Center card below target
      cardLeft = rect.left + rect.width / 2 - cardRect.width / 2;
      cardTop = rect.bottom + margin;
      break;

    case "bottom-left":
      // Align card's left edge with target's left edge, below it
      cardLeft = rect.left;
      cardTop = rect.bottom + margin;
      break;

    case "bottom-right":
      // Align card's right edge with target's right edge, below it
      cardLeft = rect.right - cardRect.width;
      cardTop = rect.bottom + margin;
      break;

    case "top":
      // Center card above target
      cardLeft = rect.left + rect.width / 2 - cardRect.width / 2;
      cardTop = rect.top - cardRect.height - margin;
      break;

    case "top-left":
      // Align card's left edge with target's left edge, above it
      cardLeft = rect.left;
      cardTop = rect.top - cardRect.height - margin;
      break;

    case "top-right":
      // Align card's right edge with target's right edge, above it
      cardLeft = rect.right - cardRect.width;
      cardTop = rect.top - cardRect.height - margin;
      break;

    case "right":
      // Position card to the right, vertically centered
      cardLeft = rect.right + margin;
      cardTop = rect.top + rect.height / 2 - cardRect.height / 2;
      break;

    case "left":
      // Position card to the left, vertically centered
      cardLeft = rect.left - cardRect.width - margin;
      cardTop = rect.top + rect.height / 2 - cardRect.height / 2;
      break;

    default:
      // Default to bottom-left
      cardLeft = rect.left;
      cardTop = rect.bottom + margin;
  }

  // Viewport bounds checking with padding
  const viewportPadding = 15;
  const maxLeft = window.innerWidth - cardRect.width - viewportPadding;
  const maxTop = window.innerHeight - cardRect.height - viewportPadding;

  // Horizontal bounds
  if (cardLeft < viewportPadding) {
    cardLeft = viewportPadding;
  } else if (cardLeft > maxLeft) {
    cardLeft = maxLeft;
  }

  // Vertical bounds with smart repositioning
  if (cardTop < viewportPadding) {
    // If card would be above viewport, try positioning below target
    const belowPosition = rect.bottom + margin;
    if (
      belowPosition + cardRect.height <
      window.innerHeight - viewportPadding
    ) {
      cardTop = belowPosition;
    } else {
      cardTop = viewportPadding;
    }
  } else if (cardTop > maxTop) {
    // If card would be below viewport, try positioning above target
    const abovePosition = rect.top - cardRect.height - margin;
    if (abovePosition > viewportPadding) {
      cardTop = abovePosition;
    } else {
      cardTop = maxTop;
    }
  }

  // Apply positions
  tutorialCard.style.left = cardLeft + "px";
  tutorialCard.style.top = cardTop + "px";
}

// Tutorial navigation
tutorialNextBtn.addEventListener("click", () => {
  if (currentStep < tutorialSteps.length - 1) {
    currentStep++;
    showTutorialStep(currentStep);
  } else {
    completeTutorial();
  }
});

tutorialPrevBtn.addEventListener("click", () => {
  if (currentStep > 0) {
    currentStep--;
    showTutorialStep(currentStep);
  }
});

closeTutorialBtn.addEventListener("click", () => {
  if (
    confirm(
      "Are you sure you want to skip the tutorial? You can always restart it from the settings."
    )
  ) {
    completeTutorial();
  }
});

// Complete tutorial
function completeTutorial() {
  tutorialActive = false;
  tutorialModal.style.display = "none";
  safeLocalStorage("set", "tutorialCompleted", "true");
  showNotification("Tutorial completed! Welcome to CodX Editor", "success");
}

// Handle window resize during tutorial
window.addEventListener("resize", () => {
  if (tutorialActive && currentStep < tutorialSteps.length) {
    showTutorialStep(currentStep);
  }
});

// Add "Restart Tutorial" option to settings modal
const settingsModalContent = document.querySelector("#settingsModal > div");
if (settingsModalContent) {
  const restartTutorialBtn = document.createElement("button");
  restartTutorialBtn.className = "run-button";
  restartTutorialBtn.style.cssText =
    "width: 100%; margin-top: 15px; background: #9C27B0;";
  restartTutorialBtn.innerHTML =
    '<i class="fa-solid fa-graduation-cap"></i> <strong>RESTART TUTORIAL</strong>';
  restartTutorialBtn.addEventListener("click", () => {
    settingsModal.style.display = "none";
    safeLocalStorage("remove", "tutorialCompleted");
    startTutorial();
  });

  // Insert before action buttons
  const actionButtons = settingsModalContent.querySelector(
    'div[style*="display: flex"][style*="justify-content: space-between"]'
  );
  if (actionButtons) {
    actionButtons.parentNode.insertBefore(restartTutorialBtn, actionButtons);
  }
}

// Initialize tutorial check on page load
window.addEventListener("load", () => {
  // Give the page a moment to fully render
  setTimeout(checkTutorialStatus, 800);
});

console.log("Tutorial system loaded!");
console.log("Ctrl + S: Saves current file.");
console.log("Ctrl + Enter: Manually triggers an update of the preview pane.");
console.log("Ctrl + N: Creates a new file in the project.");
console.log("Ctrl + Shift + C: Opens the console panel.");
console.log("CodX Editor loaded with file linking and tag suggestions!");
