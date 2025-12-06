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
  const newFile = {
    name,
    type: ext,
    content: "",
    active: true,
  };
  projectFiles.forEach((file) => (file.active = false));
  projectFiles.push(newFile);
  activeFile = newFile;
  const editor = document.getElementById("activeEditor");
  editor.value = "";
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
  editor.style.backgroundColor = editorBgColorInput.value;
  editor.style.color = editorTextColorInput.value;
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

  // === 1. Replace <link rel="stylesheet" href="style.css">
  html = html.replace(
    /<link[^>]*rel=["']stylesheet["'][^>]*href=["']([^"']+)["'][^>]*>/gi,
    (match, href) => {
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
        return `<link rel="stylesheet" href="${href}?file=${encodeURIComponent(
          fileName
        )}">`;
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

// PART 6.5: TAG SUGGESTIONS & AUTO-CLOSING LOGIC (NEW)

/**
 * Handles auto-closing of HTML tags when '>' is typed.
 */
function handleTagClosing(e) {
  if (e.key !== ">") return;
  if (activeFile.type !== "html") return;

  const editor = e.target;
  const pos = editor.selectionStart;
  const textBefore = editor.value.substring(0, pos);

  // Regex: Find the last opening tag <tagname just before the cursor
  // It avoids matching </tagname> or <tagname/>
  const tagMatch = textBefore.match(/<([a-zA-Z0-9]+)(?![^>]*\/?>)\s*$/);

  if (tagMatch) {
    const tagName = tagMatch[1];
    if (selfClosingTags.includes(tagName.toLowerCase())) {
      // It's a self-closing tag, just allow the '>'
      return;
    }

    // It's a regular tag, auto-close it
    e.preventDefault();
    const closingTag = `</${tagName}>`;
    const textAfter = editor.value.substring(editor.selectionEnd);

    // Insert the > and the closing tag
    editor.value = textBefore + ">" + closingTag + textAfter;

    // Place cursor between the tags
    editor.selectionStart = editor.selectionEnd = pos + 1;

    // Update content
    activeFile.content = editor.value;
    updateLineNumbers(editor);
    if (autoRunCheckbox.checked) debouncedUpdatePreview();
    handleCodeChange();
  }
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

/**
 * Handles all keydown events in the editor for suggestions, tab, and auto-closing.
 */
function handleEditorKeyDown(e) {
  const editor = e.target;

  // --- 1. Suggestion Popup Navigation ---
  if (suggestionPopup.style.display === "block") {
    const items = suggestionPopup.querySelectorAll(".suggestion-item");
    if (!items.length) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      activeSuggestion = (activeSuggestion + 1) % items.length;
      updateSuggestionHighlight(items);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      activeSuggestion = (activeSuggestion - 1 + items.length) % items.length;
      updateSuggestionHighlight(items);
    } else if (e.key === "Enter" || e.key === "Tab") {
      if (activeSuggestion > -1) {
        // Select the highlighted suggestion
        e.preventDefault();
        selectSuggestion(items[activeSuggestion].dataset.tag);
      } else {
        // Allow default behavior (like new line) if no suggestion is active
        suggestionPopup.style.display = "none";
        if (e.key === "Tab") e.preventDefault(); // Prevent tabbing out
      }
    } else if (e.key === "Escape") {
      e.preventDefault();
      suggestionPopup.style.display = "none";
    } else if (e.key === ">") {
      // Handle tag closing, then hide popup
      handleTagClosing(e);
      suggestionPopup.style.display = "none";
    }
  } else {
    // --- 2. No Popup Visible: Handle Tab and Tag Closing ---

    if (e.key === ">") {
      // Handle tag closing
      handleTagClosing(e);
    } else if (e.key === "Tab") {
      // Handle Tab for indentation
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
    }
  }
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
      <strong>FULLSCREEN PREVIEW</strong>
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
  if (e.key === sid && e.newValue) {
    try {
      const nv = JSON.parse(e.newValue);
      if (JSON.stringify(projectFiles) !== JSON.stringify(nv.files)) {
        projectFiles = nv.files;
        activeFile = projectFiles.find((f) => f.active) || projectFiles[0];
        projectFiles.forEach((f) => (f.active = f === activeFile));

        const ed = document.getElementById("activeEditor");
        const currentPos = ed.selectionStart; // Try to save cursor
        ed.value = activeFile.content;
        ed.selectionStart = ed.selectionEnd = currentPos; // Restore cursor

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

console.log("CodX Editor loaded with file linking and tag suggestions!");

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
