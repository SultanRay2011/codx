// PART 1 - INITIALIZATION & CONSTANTS
const iframe = document.getElementById("output");
const autoRunCheckbox = document.getElementById("autoRun");
const showConsoleCheckbox = document.getElementById("showConsole");
const consoleContainer = document.querySelector(".console-container");
const consoleOutput = document.getElementById("consoleOutput");
const divider = document.querySelector(".divider");
const editorsPanel = document.querySelector(".editors");
const previewPanel = document.querySelector(".preview");
const lineNumbers = document.getElementById("lineNumbers");
const highlightLayer = document.getElementById("highlightLayer");
const remoteCursorLayer = document.getElementById("remoteCursorLayer");
const editorContainer = document.querySelector(".editor-container");
const settingsBtn = document.getElementById("settingsBtn");
const settingsModal = document.getElementById("settingsModal");
const closeSettingsBtn = document.getElementById("closeSettingsBtn");
const applySettingsBtn = document.getElementById("applySettings");
const resetSettingsBtn = document.getElementById("resetSettings");
const editorBgColorInput = document.getElementById("editorBgColor");
const editorBgColorText = document.getElementById("editorBgColorText");
const editorTextSizeInput = document.getElementById("editorTextSize");
const textSizeValue = document.getElementById("textSizeValue");
const editorFontFamilySelect = document.getElementById("editorFontFamily");
const editorFontEmbedInput = document.getElementById("editorFontEmbed");
const settingsPreview = document.getElementById("settingsPreview");
const settingsPreviewCode = document.getElementById("settingsPreviewCode");
const newFileBtn = document.getElementById("newFileBtn");
const fileList = document.getElementById("fileList");
const collabBtn = document.getElementById("collabBtn");
const collabModal = document.getElementById("collabModal");
const modalTitle = document.getElementById("modalTitle");
const modalBody = document.getElementById("modalBody");
const closeModalBtn = document.getElementById("closeModalBtn");
const typingIndicatorEl = document.getElementById("typingIndicator");
const editorWatermark = document.getElementById("editorWatermark");
const exportZipBtn = document.querySelector('button[aria-label="Export project as ZIP"]');
const importZipBtn = document.querySelector('button[aria-label="Import ZIP file"]');
const previewFullscreenBtn = document.getElementById("previewFullscreenBtn");
const previewIframe = document.getElementById("output");
const previewTitleEl = document.getElementById("previewTitle");
const previewLinkEl = document.getElementById("previewLink");
const previewFaviconEl = document.getElementById("previewFavicon");
const errorMsgEl = document.getElementById("errorMsg");
const zenModeBtn = document.getElementById("zenModeBtn");
const zenExitBtn = document.getElementById("zenExitBtn");
const announcementPopup = document.getElementById("announcementPopup");
const announcementPopupText = document.getElementById("announcementPopupText");
const announcementPopupOkBtn = document.getElementById("announcementPopupOkBtn");
const appDialog = document.getElementById("appDialog");
const appDialogTitle = document.getElementById("appDialogTitle");
const appDialogMessage = document.getElementById("appDialogMessage");
const appDialogInput = document.getElementById("appDialogInput");
const appDialogActions = document.getElementById("appDialogActions");
const developerConsoleModal = document.getElementById("developerConsoleModal");
const developerConsoleOutput = document.getElementById("developerConsoleOutput");
const developerConsoleInput = document.getElementById("developerConsoleInput");
const runDeveloperCommandBtn = document.getElementById("runDeveloperCommandBtn");
const clearDeveloperConsoleBtn = document.getElementById("clearDeveloperConsoleBtn");
const closeDeveloperConsoleBtn = document.getElementById("closeDeveloperConsoleBtn");
const saveProjectBtn = document.getElementById("saveProjectBtn");
const openSavedProjectsBtn = document.getElementById("openSavedProjectsBtn");
const templatesBtn = document.getElementById("templatesBtn");
const publishProjectBtn = document.getElementById("publishProjectBtn");
const projectLibraryModal = document.getElementById("projectLibraryModal");
const closeProjectLibraryBtn = document.getElementById("closeProjectLibraryBtn");
const projectLibraryBody = document.getElementById("projectLibraryBody");
const runPreviewBtn = document.getElementById("runPreviewBtn");
const clearConsoleBtn = document.getElementById("clearConsoleBtn");
const headerMoreMenu = document.getElementById("headerMoreMenu");
const headerMoreBtn = document.getElementById("headerMoreBtn");
const headerMorePanel = document.getElementById("headerMorePanel");

function getModalDoneBtn() {
  return document.getElementById("modalDoneBtn");
}

function setHeaderMoreMenuOpen(isOpen) {
  if (!headerMoreBtn || !headerMorePanel) return;
  headerMoreBtn.setAttribute("aria-expanded", isOpen ? "true" : "false");
  headerMorePanel.hidden = !isOpen;
}

if (headerMoreBtn && headerMorePanel) {
  headerMoreBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    setHeaderMoreMenuOpen(headerMorePanel.hidden);
  });

  headerMorePanel.addEventListener("click", (e) => {
    e.stopPropagation();
  });

  document.addEventListener("click", (e) => {
    if (!headerMoreMenu || headerMorePanel.hidden) return;
    if (!headerMoreMenu.contains(e.target)) {
      setHeaderMoreMenuOpen(false);
    }
  });

  headerMorePanel.querySelectorAll("button").forEach((button) => {
    button.addEventListener("click", () => {
      setHeaderMoreMenuOpen(false);
    });
  });
}

if (announcementPopupOkBtn) {
  announcementPopupOkBtn.onclick = closeAnnouncementPopup;
}
if (announcementPopup) {
  announcementPopup.addEventListener("click", (e) => {
    if (e.target === announcementPopup) {
      closeAnnouncementPopup();
    }
  });
}
if (appDialog) {
  appDialog.addEventListener("click", (e) => {
    if (e.target === appDialog) {
      closeAppDialog({ ok: false, value: null });
    }
  });
}
if (developerConsoleModal) {
  developerConsoleModal.addEventListener("click", (e) => {
    if (e.target === developerConsoleModal) {
      closeDeveloperConsole();
    }
  });
}
if (closeDeveloperConsoleBtn) {
  closeDeveloperConsoleBtn.onclick = closeDeveloperConsole;
}
if (clearDeveloperConsoleBtn) {
  clearDeveloperConsoleBtn.onclick = clearDeveloperConsoleOutput;
}
if (runDeveloperCommandBtn) {
  runDeveloperCommandBtn.onclick = () => {
    if (!developerConsoleInput) return;
    const value = developerConsoleInput.value;
    developerConsoleInput.value = "";
    runDeveloperCommand(value);
    developerConsoleInput.focus();
  };
}
if (developerConsoleInput) {
  developerConsoleInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (runDeveloperCommandBtn) runDeveloperCommandBtn.click();
    }
    if (e.key === "Escape") {
      e.preventDefault();
      closeDeveloperConsole();
    }
  });
}

const settingsPreviewSampleCode = `function helloWorld() {
  console.log("Hello, World!");
}`;
const INDENT_UNIT = "   ";
let isZenMode = false;
const editorTextarea = document.getElementById("activeEditor");
const editorWrapperEl = editorTextarea
  ? editorTextarea.closest(".editor-wrapper")
  : null;
let errorHighlightLayer = document.getElementById("errorHighlightLayer");
if (!errorHighlightLayer && editorWrapperEl) {
  errorHighlightLayer = document.createElement("div");
  errorHighlightLayer.id = "errorHighlightLayer";
  errorHighlightLayer.setAttribute("aria-hidden", "true");
  editorWrapperEl.insertBefore(
    errorHighlightLayer,
    document.getElementById("remoteCursorLayer"),
  );
}

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
const knownHtmlTags = new Set([...allHtmlTags, ...htmlTags, ...selfClosingTags]);
// END: Tag suggestion elements

const htmlTagMetaMap = new Map();
Object.entries(htmlTagsData).forEach(([category, tags]) => {
  tags.forEach((item) => {
    htmlTagMetaMap.set(item.tag, { ...item, category });
  });
});
htmlTags.forEach((tag) => {
  if (!htmlTagMetaMap.has(tag)) {
    htmlTagMetaMap.set(tag, {
      tag,
      icon: "</>",
      desc: "HTML element",
      attrs: [],
      category: "other",
    });
  }
});
htmlTagMetaMap.set("lorem", {
  tag: "lorem",
  icon: "TXT",
  desc: "Insert lorem ipsum placeholder text",
  attrs: [],
  badge: "snippet",
  category: "snippet",
  insertText:
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
});
const tagSuggestionPool = Array.from(htmlTagMetaMap.values());
let currentSuggestionContext = null;
const globalHtmlAttributes = [
  "class",
  "id",
  "style",
  "title",
  "name",
  "value",
  "type",
  "placeholder",
  "disabled",
  "readonly",
  "required",
  "checked",
  "selected",
  "multiple",
  "autocomplete",
  "autofocus",
  "min",
  "max",
  "step",
  "role",
  "tabindex",
  "hidden",
  "draggable",
  "contenteditable",
  "spellcheck",
  "aria-label",
  "aria-labelledby",
  "aria-describedby",
  "aria-hidden",
  "aria-expanded",
  "aria-controls",
  "aria-live",
  "data-*",
];
const htmlAttributeDescriptions = {
  class: "CSS class names",
  id: "Unique element identifier",
  style: "Inline CSS styles",
  title: "Tooltip text",
  name: "Form field or element name",
  value: "Current field value",
  type: "Input or resource type",
  placeholder: "Hint text",
  disabled: "Disable interaction",
  readonly: "Make field read-only",
  required: "Require a value before submit",
  checked: "Pre-check checkbox or radio",
  selected: "Preselect option",
  multiple: "Allow multiple values",
  autocomplete: "Browser autocomplete behavior",
  autofocus: "Focus automatically on load",
  min: "Minimum allowed value",
  max: "Maximum allowed value",
  step: "Increment step value",
  role: "Accessibility role",
  tabindex: "Keyboard focus order",
  hidden: "Hide element",
  draggable: "Allow drag behavior",
  contenteditable: "Make content editable",
  spellcheck: "Enable spell checking",
  "aria-label": "Accessible label",
  "aria-labelledby": "Reference another label element",
  "aria-describedby": "Reference descriptive text",
  "aria-hidden": "Hide from assistive tech",
  "aria-expanded": "Expanded/collapsed state",
  "aria-controls": "Controlled element id",
  "aria-live": "Announce dynamic updates",
  "data-*": "Custom data attribute",
  href: "Link destination",
  src: "Source URL or file path",
  alt: "Image alternative text",
  width: "Display width",
  height: "Display height",
  controls: "Show media controls",
  autoplay: "Start media automatically",
  loop: "Repeat media playback",
  muted: "Mute media by default",
  poster: "Preview image for video",
  action: "Form submit URL",
  method: "Form submit method",
  enctype: "Form encoding type",
  for: "Associated input id",
  target: "Open destination target",
  rel: "Relationship metadata",
  lang: "Language code",
  charset: "Character encoding",
  content: "Meta content value",
  rows: "Textarea row count",
  cols: "Textarea column count",
  scope: "Header cell scope",
  colspan: "Cell column span",
  rowspan: "Cell row span",
  cite: "Citation URL",
  controlslist: "Allowed media controls",
  download: "Download target resource",
  loading: "Lazy/eager loading behavior",
  decoding: "Image decoding hint",
  srcset: "Responsive image sources",
  sizes: "Responsive image sizes",
  media: "Media query condition",
  async: "Load script asynchronously",
  defer: "Defer script execution",
  integrity: "Subresource integrity hash",
  crossorigin: "Cross-origin request mode",
  referrerpolicy: "Referrer handling policy",
  sandbox: "Restrict iframe capabilities",
  allow: "Iframe feature policy",
  srcdoc: "Inline iframe HTML",
  open: "Open details/dialog by default",
  datetime: "Machine-readable date or time",
  pattern: "Input validation pattern",
  minlength: "Minimum input length",
  maxlength: "Maximum input length",
};

const cssPropertySuggestions = [
  "display",
  "position",
  "top",
  "right",
  "bottom",
  "left",
  "z-index",
  "width",
  "height",
  "min-width",
  "max-width",
  "min-height",
  "max-height",
  "margin",
  "margin-top",
  "margin-right",
  "margin-bottom",
  "margin-left",
  "padding",
  "padding-top",
  "padding-right",
  "padding-bottom",
  "padding-left",
  "border",
  "border-radius",
  "border-color",
  "border-width",
  "outline",
  "box-shadow",
  "background",
  "background-color",
  "background-image",
  "background-size",
  "background-position",
  "background-repeat",
  "color",
  "opacity",
  "font",
  "font-size",
  "font-family",
  "font-weight",
  "line-height",
  "letter-spacing",
  "text-align",
  "text-decoration",
  "text-transform",
  "white-space",
  "overflow",
  "overflow-x",
  "overflow-y",
  "visibility",
  "cursor",
  "transition",
  "transform",
  "animation",
  "grid-template-columns",
  "grid-template-rows",
  "gap",
  "justify-content",
  "align-items",
  "flex",
  "flex-direction",
];

const cssValueSuggestionsByProperty = {
  display: ["block", "inline", "inline-block", "flex", "grid", "none"],
  position: ["static", "relative", "absolute", "fixed", "sticky"],
  color: [
    "#000",
    "#fff",
    "#ef4444",
    "#3b82f6",
    "#22c55e",
    "#f59e0b",
    "#a855f7",
    "#ec4899",
    "black",
    "white",
    "red",
    "blue",
    "green",
    "yellow",
    "orange",
    "purple",
    "pink",
    "teal",
    "gray",
    "rgb(0, 0, 0)",
    "rgba(0, 0, 0, 0.5)",
    "transparent",
    "inherit",
  ],
  "background-color": [
    "transparent",
    "#fff",
    "#000",
    "#ef4444",
    "#3b82f6",
    "#22c55e",
    "#f59e0b",
    "#a855f7",
    "black",
    "white",
    "red",
    "blue",
    "green",
    "yellow",
    "orange",
    "purple",
    "pink",
    "teal",
    "gray",
    "inherit",
  ],
  "background-repeat": ["no-repeat", "repeat", "repeat-x", "repeat-y"],
  "background-size": ["cover", "contain", "auto"],
  "text-align": ["left", "center", "right", "justify"],
  "font-family": [
    "Arial, sans-serif",
    "Verdana, sans-serif",
    "'Trebuchet MS', sans-serif",
    "Tahoma, sans-serif",
    "'Century Gothic', sans-serif",
    "'Franklin Gothic Medium', sans-serif",
    "'Gill Sans', 'Gill Sans MT', sans-serif",
    "Optima, 'Segoe UI', sans-serif",
    "Futura, 'Century Gothic', sans-serif",
    "Avenir, 'Trebuchet MS', sans-serif",
    "'Times New Roman', serif",
    "Georgia, serif",
    "Garamond, serif",
    "'Palatino Linotype', serif",
    "Cambria, serif",
    "Baskerville, Georgia, serif",
    "'Book Antiqua', Palatino, serif",
    "'Bodoni MT', 'Times New Roman', serif",
    "Didot, 'Times New Roman', serif",
    "Rockwell, 'Courier New', serif",
    "'Courier New', monospace",
    "Consolas, monospace",
    "'Lucida Console', monospace",
    "Monaco, 'Lucida Console', monospace",
    "Menlo, Consolas, monospace",
    "'Andale Mono', Consolas, monospace",
    "Impact, fantasy",
    "Copperplate, fantasy",
    "Papyrus, fantasy",
    "Stencil, Impact, fantasy",
    "'Brush Script MT', cursive",
    "'Segoe Script', 'Brush Script MT', cursive",
    "'Bradley Hand', 'Comic Sans MS', cursive",
    "'Comic Sans MS', cursive",
    "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    "ui-sans-serif, system-ui, sans-serif",
    "ui-serif, Georgia, serif",
    "ui-monospace, SFMono-Regular, Menlo, monospace",
  ],
  "font-weight": ["400", "500", "600", "700", "bold", "normal"],
  "font-style": ["normal", "italic", "oblique"],
  "font-size": ["12px", "14px", "16px", "18px", "1rem", "1.25rem", "2rem", "clamp(1rem, 2vw, 2rem)"],
  "line-height": ["1", "1.2", "1.5", "1.7", "2", "normal"],
  "text-decoration": ["none", "underline", "overline", "line-through"],
  "text-transform": ["none", "uppercase", "lowercase", "capitalize"],
  "letter-spacing": ["normal", "0.02em", "0.05em", "0.1em"],
  "border-radius": ["0", "4px", "8px", "12px", "999px", "50%"],
  margin: ["0", "8px", "16px", "24px", "0 auto", "1rem auto"],
  padding: ["0", "8px", "12px", "16px", "24px", "1rem 1.5rem"],
  width: ["auto", "100%", "100vw", "fit-content", "min-content", "max-content"],
  height: ["auto", "100%", "100vh", "fit-content"],
  "max-width": ["100%", "480px", "720px", "960px", "1200px"],
  "min-height": ["100vh", "50vh", "320px"],
  overflow: ["hidden", "auto", "scroll", "visible"],
  "overflow-x": ["hidden", "auto", "scroll", "visible"],
  "overflow-y": ["hidden", "auto", "scroll", "visible"],
  cursor: ["pointer", "default", "text", "not-allowed", "move"],
  "align-self": ["auto", "stretch", "flex-start", "center", "flex-end"],
  "justify-content": [
    "flex-start",
    "center",
    "flex-end",
    "space-between",
    "space-around",
    "space-evenly",
  ],
  "align-items": ["stretch", "flex-start", "center", "flex-end", "baseline"],
  "flex-direction": ["row", "row-reverse", "column", "column-reverse"],
  "flex-wrap": ["nowrap", "wrap", "wrap-reverse"],
  "object-fit": ["cover", "contain", "fill", "none", "scale-down"],
  "box-shadow": ["none", "0 8px 24px rgba(0, 0, 0, 0.12)", "0 18px 40px rgba(0, 0, 0, 0.16)"],
  "background-image": ["none", "linear-gradient(135deg, #ffffff, #f3f4f6)", "url(\"\")"],
};

const cssGenericValueSuggestions = [
  "auto",
  "inherit",
  "initial",
  "unset",
  "none",
  "0",
  "100%",
  "1rem",
  "2rem",
];

const cssSelectorSuggestions = [
  "body",
  "html",
  "main",
  "header",
  "section",
  "article",
  ".class-name",
  "#id-name",
  ":root",
  "@media",
  "@keyframes",
];

const jsSuggestions = [
  { value: "const", desc: "Declare a constant", insertText: "const " },
  { value: "let", desc: "Declare a block variable", insertText: "let " },
  { value: "function", desc: "Create a function", insertText: "function " },
  { value: "return", desc: "Return a value", insertText: "return " },
  { value: "if", desc: "Conditional statement", insertText: "if () {\n" + INDENT_UNIT + "\n}" },
  { value: "else", desc: "Fallback branch", insertText: "else {\n" + INDENT_UNIT + "\n}" },
  { value: "for", desc: "Loop over a range", insertText: "for (let i = 0; i < ; i++) {\n" + INDENT_UNIT + "\n}" },
  { value: "while", desc: "While loop", insertText: "while () {\n" + INDENT_UNIT + "\n}" },
  { value: "async", desc: "Async function keyword", insertText: "async " },
  { value: "await", desc: "Wait for a promise", insertText: "await " },
  { value: "console.log", desc: "Log to console", insertText: "console.log();" },
  { value: "document.querySelector", desc: "Select one DOM element", insertText: "document.querySelector(\"\");" },
  { value: "document.querySelectorAll", desc: "Select all matching DOM elements", insertText: "document.querySelectorAll(\"\");" },
  { value: "addEventListener", desc: "Attach an event listener", insertText: "addEventListener(\"\", () => {\n" + INDENT_UNIT + "\n});" },
  { value: "fetch", desc: "Make a network request", insertText: "fetch(\"\")\n  .then((response) => response.json())\n  .then((data) => {\n" + INDENT_UNIT + "console.log(data);\n  });" },
  { value: "setTimeout", desc: "Run code later", insertText: "setTimeout(() => {\n" + INDENT_UNIT + "\n}, 1000);" },
  { value: "try", desc: "Handle exceptions", insertText: "try {\n" + INDENT_UNIT + "\n} catch (error) {\n" + INDENT_UNIT + "console.error(error);\n}" },
  { value: "class", desc: "Define a class", insertText: "class Name {\n" + INDENT_UNIT + "constructor() {\n" + INDENT_UNIT + INDENT_UNIT + "\n" + INDENT_UNIT + "}\n}" },
];

let hasUnsavedChanges = false;
let autoRunTimeout;
let sessionData = {};
let typingTimer;
let myInfo = {};
let collabSocket = null;
let collabParticipants = [];
let activeSessionId = null;
let isApplyingRemoteState = false;
let currentTypingIndicator = null;
let collabGroupMessages = [];
let collabPrivateMessages = [];
let collabChatMode = "group";
let collabChatTarget = "";
let remoteCursorState = {};
let remoteTypingState = {};
let lastCursorEmitAt = 0;
let fileErrorCounts = {};
let fileErrorLocations = {};
const defaultCollabPermissions = {
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
let collabPermissions = { ...defaultCollabPermissions };
let collabHostName = "";
let collabModalView = "idle";
let followedParticipantName = "";
let collabPendingJoins = [];
let collabShareLink = "";
let joinRequestContext = { sessionId: "", name: "" };
let lastAnnouncementText = "";
let activeDialogResolver = null;
let developerChordArmed = false;
let developerChordTimer = null;
const editableTextExtensions = ["html", "css", "js", "env"];
const SAVED_PROJECTS_KEY = "codxSavedProjects";
const AUTOSAVE_PROJECT_KEY = "codxAutosaveProject";
const AUTOSAVE_META_KEY = "codxAutosaveMeta";
let autosaveTimer = null;

const starterTemplates = [
  {
    id: "landing-page",
    name: "Landing Page",
    icon: "fa-rocket",
    accent: "#2ea043",
    tone: "Launch-ready",
    description: "Hero, feature cards, and call-to-action sections for a polished product page.",
    highlights: ["Hero section", "Feature cards", "CTA layout"],
    files: [
      {
        name: "index.html",
        type: "html",
        content: `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Launch Better</title>
    <link rel="stylesheet" href="style.css" />
  </head>
  <body>
    <main class="hero">
      <p class="eyebrow">Launch Week Ready</p>
      <h1>Build a cleaner story for your product.</h1>
      <p class="lead">A simple landing page starter with a strong hero, proof points, and a clear call to action.</p>
      <a class="cta" href="#features">Explore Features</a>
    </main>
    <section id="features" class="features">
      <article><h2>Fast setup</h2><p>Start with structure instead of a blank screen.</p></article>
      <article><h2>Responsive by default</h2><p>Designed to adapt across desktop, tablet, and mobile.</p></article>
      <article><h2>Clean visual system</h2><p>Easy to restyle without untangling a heavy framework.</p></article>
    </section>
    <script src="script.js"></script>
  </body>
</html>`,
      },
      {
        name: "style.css",
        type: "css",
        content: `:root {
  --bg: #f6fff7;
  --surface: #ffffff;
  --ink: #162019;
  --muted: #58655d;
  --accent: #2ea043;
}

* { box-sizing: border-box; }
body {
  margin: 0;
  font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
  color: var(--ink);
  background:
    radial-gradient(circle at top left, rgba(46, 160, 67, 0.16), transparent 24%),
    linear-gradient(135deg, var(--bg), #ffffff 60%);
}
.hero {
  max-width: 960px;
  margin: 0 auto;
  padding: 96px 24px 48px;
}
.eyebrow {
  display: inline-block;
  padding: 8px 12px;
  border-radius: 999px;
  background: rgba(46, 160, 67, 0.12);
  color: var(--accent);
  font-weight: 700;
}
h1 {
  font-size: clamp(2.4rem, 7vw, 4.8rem);
  line-height: 1;
  max-width: 11ch;
  margin: 20px 0 16px;
}
.lead {
  max-width: 56ch;
  line-height: 1.7;
  color: var(--muted);
}
.cta {
  display: inline-block;
  margin-top: 24px;
  padding: 14px 20px;
  border-radius: 14px;
  text-decoration: none;
  background: var(--accent);
  color: white;
  font-weight: 700;
}
.features {
  max-width: 960px;
  margin: 0 auto;
  padding: 0 24px 72px;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 18px;
}
.features article {
  background: var(--surface);
  border: 1px solid rgba(22, 32, 25, 0.08);
  border-radius: 22px;
  padding: 22px;
  box-shadow: 0 18px 40px rgba(24, 46, 31, 0.08);
}
.features p {
  color: var(--muted);
  line-height: 1.65;
}`,
      },
      {
        name: "script.js",
        type: "js",
        content: `console.log("Landing page template ready.");`,
      },
    ],
  },
  {
    id: "portfolio",
    name: "Portfolio",
    icon: "fa-id-card",
    accent: "#c0841a",
    tone: "Personal brand",
    description: "A personal portfolio starter with intro, projects, and contact section.",
    highlights: ["Intro header", "Project grid", "Simple navigation"],
    files: [
      {
        name: "index.html",
        type: "html",
        content: `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Creative Portfolio</title>
    <link rel="stylesheet" href="style.css" />
  </head>
  <body>
    <header class="topbar">
      <strong>Alex Carter</strong>
      <nav>
        <a href="#work">Work</a>
        <a href="#about">About</a>
        <a href="#contact">Contact</a>
      </nav>
    </header>
    <main class="intro">
      <p class="eyebrow">Designer + Frontend Developer</p>
      <h1>I design digital experiences with clarity and edge.</h1>
    </main>
    <section id="work" class="grid">
      <article><h2>Brand site</h2><p>Marketing site with bold typography and high-contrast sections.</p></article>
      <article><h2>Dashboard</h2><p>Internal tool UI focused on faster reporting and review flow.</p></article>
      <article><h2>Prototype</h2><p>Interactive concept page built for investor storytelling.</p></article>
    </section>
  </body>
</html>`,
      },
      {
        name: "style.css",
        type: "css",
        content: `body {
  margin: 0;
  font-family: Georgia, "Times New Roman", serif;
  background: #fbf8f1;
  color: #1e1d19;
}
.topbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 22px 28px;
}
.topbar nav {
  display: flex;
  gap: 18px;
}
.topbar a {
  color: inherit;
  text-decoration: none;
}
.intro {
  padding: 72px 28px 28px;
}
.eyebrow {
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-size: 0.8rem;
}
h1 {
  max-width: 10ch;
  font-size: clamp(2.5rem, 7vw, 5.2rem);
  line-height: 0.96;
  margin: 18px 0 0;
}
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 18px;
  padding: 28px;
}
.grid article {
  background: white;
  border-radius: 20px;
  padding: 20px;
  border: 1px solid rgba(30, 29, 25, 0.08);
}`,
      },
      { name: "script.js", type: "js", content: `console.log("Portfolio template ready.");` },
    ],
  },
  {
    id: "contact-form",
    name: "Contact Form",
    icon: "fa-envelope-open-text",
    accent: "#2563eb",
    tone: "Lead capture",
    description: "A polished form starter with responsive card layout and validation hooks.",
    highlights: ["Responsive form", "Card layout", "Validation-ready"],
    files: [
      {
        name: "index.html",
        type: "html",
        content: `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Contact Us</title>
    <link rel="stylesheet" href="style.css" />
  </head>
  <body>
    <main class="shell">
      <form class="card">
        <h1>Get in touch</h1>
        <label>Name<input type="text" placeholder="Your name" /></label>
        <label>Email<input type="email" placeholder="you@example.com" /></label>
        <label>Message<textarea rows="6" placeholder="Write your message"></textarea></label>
        <button type="submit">Send Message</button>
      </form>
    </main>
  </body>
</html>`,
      },
      {
        name: "style.css",
        type: "css",
        content: `body {
  margin: 0;
  min-height: 100vh;
  display: grid;
  place-items: center;
  background: linear-gradient(135deg, #effaf0, #ffffff 58%, #eef4ff);
  font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
}
.shell {
  width: min(92vw, 560px);
}
.card {
  background: white;
  padding: 28px;
  border-radius: 24px;
  box-shadow: 0 18px 42px rgba(26, 49, 32, 0.1);
  display: grid;
  gap: 16px;
}
label {
  display: grid;
  gap: 8px;
  font-weight: 600;
}
input, textarea, button {
  font: inherit;
}
input, textarea {
  padding: 12px 14px;
  border-radius: 14px;
  border: 1px solid rgba(20, 41, 27, 0.12);
}
button {
  border: none;
  border-radius: 14px;
  padding: 14px 18px;
  background: #2ea043;
  color: white;
  font-weight: 700;
}`,
      },
      { name: "script.js", type: "js", content: `console.log("Contact form template ready.");` },
    ],
  },
];

function resetTransientCollabUiState() {
  currentTypingIndicator = null;
  remoteCursorState = {};
  remoteTypingState = {};
  followedParticipantName = "";
  lastAnnouncementText = "";
  if (announcementPopup) {
    announcementPopup.style.display = "none";
  }
  if (typingIndicatorEl) {
    typingIndicatorEl.style.display = "none";
  }
  renderRemoteCursors();
}

function getCollabAnnouncementEl() {
  let el = document.getElementById("collabAnnouncementBar");
  if (!el) {
    el = document.createElement("div");
    el.id = "collabAnnouncementBar";
    el.style.cssText = `
      display:none;
      padding:10px 18px;
      background:linear-gradient(90deg, rgba(35,134,54,0.18), rgba(35,134,54,0.06));
      border-bottom:1px solid var(--border-color);
      color:var(--text-primary);
      font-size:13px;
      font-weight:600;
    `;
    const header = document.querySelector("header");
    if (header && header.parentNode) {
      header.parentNode.insertBefore(el, header.nextSibling);
    }
  }
  return el;
}

function formatSessionTimeRemaining(ts) {
  const value = Number(ts || 0);
  if (!value || value <= Date.now()) return "Expired";
  const totalSeconds = Math.max(0, Math.floor((value - Date.now()) / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  if (hours > 0) {
    const remainingMinutes = Math.floor((totalSeconds % 3600) / 60);
    return `${hours}:${String(remainingMinutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

function applyRoomIndicators() {
  const el = getCollabAnnouncementEl();
  if (!el) return;
  const parts = [];
  if (collabPermissions.announcementBar) {
    parts.push(`Announcement: ${collabPermissions.announcementBar}`);
  }
  if (collabPermissions.pinnedFile) {
    parts.push(`Pinned file: ${collabPermissions.pinnedFile}`);
  }
  if (collabPermissions.groupHighlightFile) {
    parts.push(`Team focus: ${collabPermissions.groupHighlightFile}`);
  }
  if (collabPermissions.sessionEndsAt) {
    parts.push(`Timer: ${formatSessionTimeRemaining(collabPermissions.sessionEndsAt)}`);
  }
  el.textContent = parts.join(" | ");
  el.style.display = parts.length ? "block" : "none";
}

function closeAnnouncementPopup() {
  if (announcementPopup) {
    announcementPopup.style.display = "none";
  }
}

function showAnnouncementPopup(message) {
  const text = String(message || "").trim();
  if (!announcementPopup || !announcementPopupText) return;
  if (!text) {
    closeAnnouncementPopup();
    return;
  }
  announcementPopupText.textContent = text;
  announcementPopup.style.display = "flex";
  if (announcementPopupOkBtn) {
    announcementPopupOkBtn.focus();
  }
}

function appendDeveloperConsoleLine(text = "") {
  if (!developerConsoleOutput) return;
  developerConsoleOutput.textContent += `${text}\n`;
  developerConsoleOutput.scrollTop = developerConsoleOutput.scrollHeight;
}

function clearDeveloperConsoleOutput() {
  if (!developerConsoleOutput) return;
  developerConsoleOutput.textContent = "";
}

function closeDeveloperConsole() {
  if (!developerConsoleModal) return;
  developerConsoleModal.style.display = "none";
}

function openDeveloperConsole() {
  if (!developerConsoleModal) return;
  developerConsoleModal.style.display = "flex";
  clearDeveloperConsoleOutput();
  appendDeveloperConsoleLine("CodX Developer Tools");
  appendDeveloperConsoleLine("Type 'help' to see available commands.");
  appendDeveloperConsoleLine("");
  runDeveloperCommand("state", false);
  if (developerConsoleInput) {
    developerConsoleInput.value = "";
    developerConsoleInput.focus();
  }
}

function setDeveloperChordArmed(value) {
  developerChordArmed = Boolean(value);
  if (developerChordTimer) {
    clearTimeout(developerChordTimer);
    developerChordTimer = null;
  }
  if (developerChordArmed) {
    developerChordTimer = setTimeout(() => {
      developerChordArmed = false;
      developerChordTimer = null;
    }, 1400);
  }
}

function getDeveloperStateSummary() {
  return {
    activeFile: activeFile ? activeFile.name : null,
    projectFileCount: projectFiles.length,
    previewTarget: currentPreviewTarget,
    autoRun: Boolean(autoRunCheckbox?.checked),
    consoleVisible: Boolean(showConsoleCheckbox?.checked),
    zenMode: Boolean(isZenMode),
    activeSessionId: activeSessionId || null,
    role: getMyRole(),
    participantCount: collabParticipants.length,
    errorFileCount: Object.keys(fileErrorCounts || {}).length,
  };
}

function runDeveloperCommand(rawCommand, echoCommand = true) {
  const command = String(rawCommand || "").trim().toLowerCase();
  if (!command) return;
  if (echoCommand) {
    appendDeveloperConsoleLine(`> ${command}`);
  }
  switch (command) {
    case "help":
      appendDeveloperConsoleLine("Commands:");
      appendDeveloperConsoleLine("help");
      appendDeveloperConsoleLine("state");
      appendDeveloperConsoleLine("files");
      appendDeveloperConsoleLine("participants");
      appendDeveloperConsoleLine("permissions");
      appendDeveloperConsoleLine("errors");
      appendDeveloperConsoleLine("preview");
      appendDeveloperConsoleLine("clear");
      appendDeveloperConsoleLine("close");
      break;
    case "state":
      appendDeveloperConsoleLine(JSON.stringify(getDeveloperStateSummary(), null, 2));
      break;
    case "files":
      appendDeveloperConsoleLine(
        JSON.stringify(
          projectFiles.map((file) => ({
            name: file.name,
            type: file.type,
            active: Boolean(file.active),
            length: String(file.content || "").length,
          })),
          null,
          2,
        ),
      );
      break;
    case "participants":
      appendDeveloperConsoleLine(
        JSON.stringify(
          collabParticipants.map((participant) => ({
            name: participant.name,
            role: participant.role || "participant",
            currentFile: participant.currentFile || null,
            mutedChat: Boolean(participant.mutedChat),
            frozenEditing: Boolean(participant.frozenEditing),
            priority: Boolean(participant.priority),
          })),
          null,
          2,
        ),
      );
      break;
    case "permissions":
      appendDeveloperConsoleLine(JSON.stringify(collabPermissions, null, 2));
      break;
    case "errors":
      appendDeveloperConsoleLine(
        JSON.stringify(
          {
            counts: fileErrorCounts,
            locations: fileErrorLocations,
          },
          null,
          2,
        ),
      );
      break;
    case "preview":
      appendDeveloperConsoleLine(
        JSON.stringify(
          {
            target: currentPreviewTarget,
            title: previewTitleEl ? previewTitleEl.textContent : "",
          },
          null,
          2,
        ),
      );
      break;
    case "clear":
      clearDeveloperConsoleOutput();
      break;
    case "close":
      closeDeveloperConsole();
      break;
    default:
      appendDeveloperConsoleLine(`Unknown command: ${command}`);
      appendDeveloperConsoleLine("Type 'help' for available commands.");
  }
  appendDeveloperConsoleLine("");
}

function closeAppDialog(result = null) {
  if (appDialog) appDialog.style.display = "none";
  if (appDialogInput) {
    appDialogInput.style.display = "none";
    appDialogInput.value = "";
    appDialogInput.onkeydown = null;
  }
  if (appDialogActions) {
    appDialogActions.innerHTML = "";
  }
  const resolver = activeDialogResolver;
  activeDialogResolver = null;
  if (resolver) resolver(result);
}

function showAppDialog({
  title = "Dialog",
  message = "",
  input = false,
  inputValue = "",
  inputPlaceholder = "",
  okText = "OK",
  cancelText = "Cancel",
  okVariant = "",
}) {
  return new Promise((resolve) => {
    activeDialogResolver = resolve;
    if (appDialogTitle) appDialogTitle.textContent = title;
    if (appDialogMessage) appDialogMessage.textContent = message;
    if (appDialogInput) {
      appDialogInput.style.display = input ? "block" : "none";
      appDialogInput.value = input ? String(inputValue || "") : "";
      appDialogInput.placeholder = input ? String(inputPlaceholder || "") : "";
    }
    if (appDialogActions) {
      appDialogActions.innerHTML = `
        <button type="button" id="appDialogCancelBtn" class="run-button" style="background:#6b7280;"><strong>${escapeHtml(cancelText)}</strong></button>
        <button type="button" id="appDialogOkBtn" class="run-button"${okVariant ? ` style="${escapeHtml(okVariant)}"` : ""}><strong>${escapeHtml(okText)}</strong></button>
      `;
    }
    if (appDialog) appDialog.style.display = "flex";
    const cancelBtn = document.getElementById("appDialogCancelBtn");
    const okBtn = document.getElementById("appDialogOkBtn");
    if (cancelBtn) cancelBtn.onclick = () => closeAppDialog({ ok: false, value: null });
    if (okBtn) {
      okBtn.onclick = () =>
        closeAppDialog({
          ok: true,
          value: input && appDialogInput ? appDialogInput.value : true,
        });
    }
    if (appDialogInput) {
      appDialogInput.onkeydown = (e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          if (okBtn) okBtn.click();
        } else if (e.key === "Escape") {
          e.preventDefault();
          if (cancelBtn) cancelBtn.click();
        }
      };
    }
    if (input && appDialogInput) {
      setTimeout(() => appDialogInput.focus(), 0);
    } else if (okBtn) {
      setTimeout(() => okBtn.focus(), 0);
    }
  });
}

function showAppPrompt(title, message, inputValue = "", inputPlaceholder = "") {
  return showAppDialog({
    title,
    message,
    input: true,
    inputValue,
    inputPlaceholder,
    okText: "OK",
    cancelText: "CANCEL",
  });
}

function showAppConfirm(title, message, okText = "YES", cancelText = "NO", okVariant = "") {
  return showAppDialog({
    title,
    message,
    input: false,
    okText,
    cancelText,
    okVariant,
  });
}

function resetFileErrorCounts() {
  fileErrorCounts = {};
  fileErrorLocations = {};
}

function resolveProjectFileName(rawName) {
  const candidate = String(rawName || "").trim().split(/[\\/]/).pop();
  if (!candidate) return null;
  const match = projectFiles.find(
    (f) => f.name.toLowerCase() === candidate.toLowerCase(),
  );
  return match ? match.name : null;
}

function extractFileNameFromConsoleMessage(message) {
  const text = String(message || "");
  const bracketMatch = text.match(/\[([^\]]+\.(?:html|css|js))\]/i);
  if (bracketMatch) return resolveProjectFileName(bracketMatch[1]);

  const plainMatch = text.match(/\b([A-Za-z0-9_.-]+\.(?:html|css|js))\b/i);
  if (plainMatch) return resolveProjectFileName(plainMatch[1]);

  return null;
}

function extractErrorLocationFromConsoleMessage(message) {
  const text = String(message || "");
  const fileName = extractFileNameFromConsoleMessage(text);
  if (!fileName) return null;

  const lineColMatch =
    text.match(/\bline\s+(\d+)\s*[: ,]\s*(?:col\s*)?(\d+)\b/i) ||
    text.match(/\bline\s+(\d+)\s*,\s*col\s+(\d+)\b/i);
  if (lineColMatch) {
    return {
      fileName,
      line: Number(lineColMatch[1]),
      col: Number(lineColMatch[2]),
    };
  }

  const compactMatch = text.match(/\bline\s+(\d+):(\d+)\b/i);
  if (compactMatch) {
    return {
      fileName,
      line: Number(compactMatch[1]),
      col: Number(compactMatch[2]),
    };
  }

  const nearLineMatch = text.match(/\bnear line\s+(\d+)\b/i);
  if (nearLineMatch) {
    return {
      fileName,
      line: Number(nearLineMatch[1]),
      col: 1,
    };
  }

  const atLineMatch = text.match(/\bat line\s+(\d+)\b/i);
  if (atLineMatch) {
    return {
      fileName,
      line: Number(atLineMatch[1]),
      col: 1,
    };
  }

  return {
    fileName,
    line: 1,
    col: 1,
  };
}

function getTextIndexForLineAndColumn(text, line, col) {
  const lines = String(text || "").split("\n");
  const safeLine = Math.max(1, Number(line || 1));
  const safeCol = Math.max(1, Number(col || 1));
  let index = 0;

  for (let i = 0; i < lines.length; i++) {
    const currentLine = i + 1;
    if (currentLine === safeLine) {
      return index + Math.min(safeCol - 1, lines[i].length);
    }
    index += lines[i].length + 1;
  }

  return text.length;
}

function getLineAndColumnFromIndex(text, index) {
  const safeText = String(text || "");
  const safeIndex = Math.max(0, Math.min(Number(index || 0), safeText.length));
  const before = safeText.slice(0, safeIndex);
  const lines = before.split("\n");
  return {
    line: lines.length,
    col: (lines[lines.length - 1] || "").length + 1,
  };
}

function jumpToEditorLocation(fileName, line, col = 1) {
  const normalizedFileName = String(fileName || "").trim().toLowerCase();
  const targetFile = projectFiles.find(
    (file) => String(file.name || "").trim().toLowerCase() === normalizedFileName,
  );
  if (!targetFile) return;

  if (
    !activeFile ||
    String(activeFile.name || "").trim().toLowerCase() !== normalizedFileName
  ) {
    switchFile(targetFile.name);
  }

  const editor = document.getElementById("activeEditor");
  if (!editor) return;

  const caretIndex = getTextIndexForLineAndColumn(
    targetFile.content || "",
    line,
    col,
  );

  editor.focus();
  editor.setSelectionRange(caretIndex, caretIndex);

  const computed = window.getComputedStyle(editor);
  const lineHeight = parseFloat(computed.lineHeight) || parseFloat(computed.fontSize) * 1.4 || 20;
  const targetTop = Math.max(0, (Math.max(1, Number(line || 1)) - 1) * lineHeight - editor.clientHeight / 2);
  editor.scrollTop = targetTop;

  if (typeof lineNumbers !== "undefined" && lineNumbers) {
    lineNumbers.scrollTop = editor.scrollTop;
  }
  if (highlightLayer) {
    highlightLayer.scrollTop = editor.scrollTop;
    highlightLayer.scrollLeft = editor.scrollLeft;
  }
}

function jumpToFirstErrorInFile(fileName) {
  const normalizedFileName = String(fileName || "").trim().toLowerCase();
  const resolvedKey =
    Object.keys(fileErrorLocations).find(
      (name) => String(name || "").trim().toLowerCase() === normalizedFileName,
    ) || fileName;
  const locations = fileErrorLocations[resolvedKey];
  if (!locations || !locations.length) {
    switchFile(resolvedKey);
    return;
  }
  const target = locations[0];
  jumpToEditorLocation(target.fileName, target.line, target.col);
}

function getErrorTokenLength(text, line, col) {
  const targetLine = String(text || "").split("\n")[Math.max(0, line - 1)] || "";
  if (!targetLine) return 1;

  let index = Math.max(0, Math.min(targetLine.length - 1, (col || 1) - 1));
  const isTokenChar = (char) => /[A-Za-z0-9_$:-]/.test(char);

  while (index < targetLine.length && /\s/.test(targetLine[index])) {
    index++;
  }
  if (index >= targetLine.length) return 1;

  if (!isTokenChar(targetLine[index])) {
    if (targetLine[index] === "<" || targetLine[index] === "/") {
      let lookAhead = index + 1;
      while (lookAhead < targetLine.length && isTokenChar(targetLine[lookAhead])) {
        lookAhead++;
      }
      return Math.max(1, lookAhead - index);
    }
    return 1;
  }

  let start = index;
  let end = index;
  while (start > 0 && isTokenChar(targetLine[start - 1])) start--;
  while (end < targetLine.length && isTokenChar(targetLine[end])) end++;
  return Math.max(1, end - start);
}

function renderErrorHighlights(textarea) {
  if (!errorHighlightLayer || !textarea || !activeFile) return;
  errorHighlightLayer.innerHTML = "";

  const activeErrorKey =
    Object.keys(fileErrorLocations).find(
      (name) =>
        String(name || "").trim().toLowerCase() ===
        String(activeFile.name || "").trim().toLowerCase(),
    ) || activeFile.name;
  const locations = (fileErrorLocations[activeErrorKey] || [])
    .filter((item) => item && Number(item.line) > 0)
    .sort((a, b) => a.line - b.line || a.col - b.col);

  if (!locations.length) return;

  const seen = new Set();
  const content = activeFile.content || "";
  const computed = window.getComputedStyle(textarea);
  const lineHeight =
    parseFloat(computed.lineHeight) ||
    parseFloat(computed.fontSize) * 1.5 ||
    20;
  const wrapperWidth =
    (editorWrapperEl && editorWrapperEl.clientWidth) || textarea.clientWidth || 0;
  const contentWidth = Math.max(0, wrapperWidth - 24);

  locations.forEach((location) => {
    const key = `${location.line}:${location.col || 1}`;
    if (seen.has(key)) return;
    seen.add(key);

    const caretIndex = getTextIndexForLineAndColumn(
      content,
      location.line,
      location.col || 1,
    );
    const coords = getCaretCoordinates(textarea, caretIndex);
    const tokenLength = getErrorTokenLength(
      content,
      Number(location.line || 1),
      Number(location.col || 1),
    );
    const endIndex = Math.min(content.length, caretIndex + tokenLength);
    const endCoords = getCaretCoordinates(textarea, endIndex);

    const lineMarker = document.createElement("div");
    lineMarker.className = "error-line-highlight";
    lineMarker.style.top = `${coords.top}px`;
    lineMarker.style.width = `${contentWidth}px`;
    lineMarker.style.height = `${Math.max(18, lineHeight)}px`;
    errorHighlightLayer.appendChild(lineMarker);

    const tokenMarker = document.createElement("div");
    tokenMarker.className = "error-token-highlight";
    tokenMarker.style.top = `${coords.top + Math.max(0, lineHeight - 3)}px`;
    tokenMarker.style.left = `${coords.left}px`;
    tokenMarker.style.width = `${Math.max(8, endCoords.left - coords.left || 10)}px`;
    errorHighlightLayer.appendChild(tokenMarker);
  });
}

function updateFileErrorCountsFromConsole() {
  const next = {};
  const locations = {};
  const errorLines = consoleOutput.querySelectorAll("div.error");
  errorLines.forEach((line) => {
    const location = extractErrorLocationFromConsoleMessage(line.textContent);
    if (!location || !location.fileName) return;
    next[location.fileName] = (next[location.fileName] || 0) + 1;
    if (!locations[location.fileName]) {
      locations[location.fileName] = [];
    }
    locations[location.fileName].push(location);
  });
  fileErrorCounts = next;
  fileErrorLocations = locations;
  renderFileList();
}
let projectFiles = [
  {
    name: "index.html",
    type: "html",
    content: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CodX Editor Starter</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <main class="shell">
      <section class="hero">
        <img class="brand-logo" src="cx.png" alt="CodX logo">
        <p class="eyebrow">CodX Editor Starter</p>
        <h1>Build and preview web apps instantly</h1>
        <p class="lead">
          Write HTML, CSS, and JavaScript in separate files and see updates live in the preview panel.
        </p>
      </section>

      <section class="grid">
        <article class="card">
          <h2>What you can do</h2>
          <ul>
            <li>Create and switch between multiple files</li>
            <li>Use Auto-Run for instant preview updates</li>
            <li>Debug quickly with the built-in console</li>
            <li>Import/Export projects as ZIP files</li>
          </ul>
        </article>

        <article class="card">
          <h2>Controls</h2>
          <ul>
            <li><kbd>Ctrl/Cmd</kbd> + <kbd>S</kbd> Export your project as a ZIP</li>
            <li><kbd>Ctrl/Cmd</kbd> + <kbd>Enter</kbd> Run preview manually</li>
            <li><kbd>Ctrl/Cmd</kbd> + <kbd>Q</kbd> Create a new file</li>
            <li><kbd>Ctrl/Cmd</kbd> + <kbd>Shift</kbd> + <kbd>C</kbd> Toggle console</li>
            <li><kbd>Esc</kbd> Exit Zen Mode</li>
            <li>Type <strong>cxstart</strong> in an empty HTML file and press <kbd>Enter</kbd></li>
          </ul>
        </article>
      </section>
    </main>

    <script src="script.js"></script>
</body>
</html>`,
    active: true,
  },
  {
    name: "style.css",
    type: "css",
    content: `:root {
  --bg: #ffffff;
  --panel: #ffffff;
  --panel-2: #f8fafc;
  --text: #111827;
  --muted: #4b5563;
  --accent: #0f766e;
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  min-height: 100vh;
  font-family: "Segoe UI", Tahoma, sans-serif;
  color: var(--text);
  background: var(--bg);
  display: grid;
  place-items: center;
  padding: 24px;
}

.shell {
  width: min(920px, 100%);
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 16px;
  padding: 28px;
  box-shadow: 0 18px 45px rgba(15, 23, 42, 0.08);
}

.brand-logo {
  width: 54px;
  height: 54px;
  object-fit: contain;
  margin-bottom: 10px;
}

.eyebrow {
  margin: 0 0 10px;
  color: var(--accent);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  font-weight: 700;
  font-size: 0.78rem;
}

h1 {
  margin: 0;
  font-size: clamp(1.6rem, 2.6vw, 2.2rem);
}

.lead {
  margin: 12px 0 0;
  color: var(--muted);
  max-width: 65ch;
}

.grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
  margin-top: 22px;
}

.card {
  background: linear-gradient(180deg, var(--panel), var(--panel-2));
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 16px;
}

h2 {
  margin: 0 0 10px;
  font-size: 1.05rem;
}

ul {
  margin: 0;
  padding-left: 18px;
}

li {
  margin: 8px 0;
  color: var(--muted);
}

kbd {
  background: #f3f4f6;
  border: 1px solid #d1d5db;
  border-bottom-width: 2px;
  border-radius: 6px;
  padding: 2px 6px;
  color: var(--text);
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 0.82rem;
}

@media (max-width: 760px) {
  .shell {
    padding: 20px;
  }

  .grid {
    grid-template-columns: 1fr;
  }
}`,
    active: false,
  },
  {
    name: "script.js",
    type: "js",
    content: `console.log('Hello World from CodX Editor!');`,
    active: false,
  },
];
let currentPreviewTarget = {
  mode: "html",
  fileName: "index.html",
};

function getPreviewTargetForFile(rawHref) {
  const normalizedHref = String(rawHref || "").trim().replace(/^\.\/+/, "");
  if (!normalizedHref || normalizedHref === "#") {
    return {
      exists: false,
      mode: "missing",
      fileName: "#",
      url: `/404-for-preview.html?file=${encodeURIComponent("#")}`,
    };
  }
  const fileName = normalizedHref.split("/").pop();
  const linkedFile = projectFiles.find((f) => {
    if (f.type !== "html") return false;
    const candidate = String(f.name || "").trim().replace(/^\.\/+/, "").toLowerCase();
    return (
      candidate === normalizedHref.toLowerCase() ||
      candidate.endsWith(`/${normalizedHref.toLowerCase()}`) ||
      candidate.split("/").pop() === fileName.toLowerCase()
    );
  });
  if (linkedFile) {
    return {
      exists: true,
      mode: "html",
      fileName: linkedFile.name,
      url: linkedFile.name,
    };
  }
  return {
    exists: false,
    mode: "missing",
    fileName,
    url: `/404-for-preview.html?file=${encodeURIComponent(fileName)}`,
  };
}

function setPreviewTarget(rawHref) {
  const nextTarget = getPreviewTargetForFile(rawHref);
  currentPreviewTarget = {
    mode: nextTarget.mode,
    fileName: nextTarget.fileName,
  };
  updatePreview();
  return false;
}

window.__codxOpenPreviewFile = setPreviewTarget;
let activeFile = projectFiles[0];

function getDefaultHtmlStarter() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CodX Editor</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <script src="script.js"></script>
</body>
</html>`;
}

function updatePreviewTitle(text) {
  if (!previewTitleEl) return;
  const next = String(text || "").trim();
  previewTitleEl.textContent = next || "Preview";
}

function updatePreviewLink(linkText) {
  if (!previewLinkEl) return;
  const next = String(linkText || "").trim();
  previewLinkEl.textContent = next || "";
  previewLinkEl.style.display = next ? "block" : "none";
}

function updatePreviewFavicon(src) {
  if (!previewFaviconEl) return;
  const next = String(src || "").trim();
  if (!next) {
    previewFaviconEl.hidden = true;
    previewFaviconEl.removeAttribute("src");
    return;
  }
  previewFaviconEl.hidden = false;
  previewFaviconEl.src = next;
}

function extractHtmlTitle(htmlText) {
  const match = String(htmlText || "").match(/<title\b[^>]*>([\s\S]*?)<\/title>/i);
  if (!match) return "";
  const temp = document.createElement("textarea");
  temp.innerHTML = match[1]
    .replace(/<[^>]+>/g, "")
    .replace(/\s+/g, " ")
    .trim();
  return temp.value.trim();
}

function extractHtmlFavicon(htmlText) {
  const html = String(htmlText || "");
  const faviconMatch = html.match(
    /<link\b[^>]*rel=["'][^"']*(?:icon|shortcut icon|apple-touch-icon)[^"']*["'][^>]*href=["']([^"']+)["'][^>]*>/i,
  );
  return faviconMatch ? String(faviconMatch[1] || "").trim() : "";
}

function resolvePreviewAssetPath(assetPath) {
  const normalizedPath = String(assetPath || "").trim();
  if (!normalizedPath) return "";
  if (
    normalizedPath.startsWith("data:") ||
    normalizedPath.startsWith("blob:") ||
    /^(https?:)?\/\//i.test(normalizedPath)
  ) {
    return normalizedPath;
  }
  const cleanPath = normalizedPath.replace(/^\.\/+/, "").toLowerCase();
  const fileName = cleanPath.split("/").pop();
  const mediaFile = projectFiles.find((file) => {
    if (file.type !== "media") return false;
    const candidate = String(file.name || "").trim().replace(/^\.\/+/, "").toLowerCase();
    return (
      candidate === cleanPath ||
      candidate.endsWith(`/${cleanPath}`) ||
      candidate.split("/").pop() === fileName
    );
  });
  if (mediaFile && mediaFile.content) {
    return mediaFile.content;
  }
  return normalizedPath.startsWith("/") ? normalizedPath : `/${normalizedPath}`;
}

const defaultSettings = {
  bgColor: "#1E1E1E",
  textSize: "14",
  fontFamily: "'JetBrains Mono', 'Consolas', monospace",
  fontEmbed: "",
};

// PART 2 - UTILITY FUNCTIONS
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

function serializeProjectState() {
  return {
    version: 1,
    files: projectFiles.map((file) => ({
      name: file.name,
      type: file.type,
      content: file.content,
      active: file.active,
    })),
    activeFileName: activeFile ? activeFile.name : "",
    previewTarget: currentPreviewTarget,
    savedAt: Date.now(),
  };
}

function applyProjectState(snapshot, sourceLabel = "project") {
  const files = Array.isArray(snapshot?.files) ? snapshot.files : [];
  if (!files.length) {
    showNotification(`No files found in ${sourceLabel}.`, "error");
    return false;
  }

  projectFiles = files.map((file, index) => ({
    name: String(file.name || `file-${index + 1}.html`),
    type: String(file.type || "html"),
    content: String(file.content || ""),
    active: false,
  }));

  const requestedActiveName = String(snapshot?.activeFileName || "").trim();
  activeFile =
    projectFiles.find((file) => file.name === requestedActiveName) ||
    projectFiles.find((file) => file.active) ||
    projectFiles[0];
  projectFiles.forEach((file) => {
    file.active = activeFile && file.name === activeFile.name;
  });

  if (snapshot?.previewTarget?.mode === "html") {
    currentPreviewTarget = {
      mode: "html",
      fileName: String(snapshot.previewTarget.fileName || activeFile?.name || ""),
    };
  } else if (activeFile?.type === "html") {
    currentPreviewTarget = { mode: "html", fileName: activeFile.name };
  }

  const editor = document.getElementById("activeEditor");
  if (editor && activeFile) {
    editor.value = activeFile.content;
    updateLineNumbers(editor);
    syncScroll(editor);
  }
  renderFileList();
  enforceCollabPermissionsUI();
  hasUnsavedChanges = false;
  scheduleProjectAutosave();
  if (autoRunCheckbox.checked) updatePreview();
  syncProjectWithSession();
  return true;
}

function scheduleProjectAutosave() {
  clearTimeout(autosaveTimer);
  autosaveTimer = setTimeout(() => {
    const snapshot = serializeProjectState();
    safeLocalStorage("set", AUTOSAVE_PROJECT_KEY, JSON.stringify(snapshot));
    safeLocalStorage(
      "set",
      AUTOSAVE_META_KEY,
      JSON.stringify({
        activeFileName: snapshot.activeFileName,
        savedAt: snapshot.savedAt,
      }),
    );
  }, 350);
}

function getSavedProjects() {
  try {
    return JSON.parse(safeLocalStorage("get", SAVED_PROJECTS_KEY) || "[]");
  } catch (_err) {
    return [];
  }
}

function setSavedProjects(projects) {
  safeLocalStorage("set", SAVED_PROJECTS_KEY, JSON.stringify(projects));
}

function saveCurrentProjectToLibrary(projectName) {
  if (activeSessionId && isReadOnlyParticipant() && collabPermissions.disableSaveProject) {
    showNotification("The host disabled saving projects for participants.", "error");
    return;
  }
  const trimmedName = String(projectName || "").trim();
  if (!trimmedName) {
    showNotification("Project name cannot be empty.", "error");
    return;
  }
  const projects = getSavedProjects();
  const snapshot = serializeProjectState();
  const existingIndex = projects.findIndex(
    (project) => String(project.name || "").trim().toLowerCase() === trimmedName.toLowerCase(),
  );
  const nextRecord = {
    id:
      existingIndex >= 0
        ? projects[existingIndex].id
        : `project-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    name: trimmedName,
    updatedAt: Date.now(),
    snapshot,
  };
  if (existingIndex >= 0) {
    projects[existingIndex] = nextRecord;
  } else {
    projects.unshift(nextRecord);
  }
  setSavedProjects(projects.slice(0, 24));
  hasUnsavedChanges = false;
  scheduleProjectAutosave();
  showNotification(`Saved project "${trimmedName}".`, "success");
}

function getSuggestedProjectName() {
  const htmlFile = projectFiles.find((file) => file.type === "html");
  const baseName = (htmlFile ? htmlFile.name : activeFile?.name || "codx-project").replace(/\.[^.]+$/, "");
  return baseName || "codx-project";
}

async function deleteSavedProject(projectId) {
  const project = getSavedProjects().find((entry) => entry.id === projectId);
  if (!project) return;
  const dialog = await showAppConfirm(
    "DELETE SAVED PROJECT",
    `Delete "${project.name}" from your saved projects?`,
    "DELETE",
    "CANCEL",
    "background:#d32f2f;",
  );
  if (!dialog?.ok) return;
  const projects = getSavedProjects().filter((entry) => entry.id !== projectId);
  setSavedProjects(projects);
  renderProjectLibrary("saved");
  showNotification("Saved project removed.", "success");
}

async function publishCurrentProject() {
  if (activeSessionId && isReadOnlyParticipant() && collabPermissions.disablePublishShare) {
    showNotification("The host disabled publish/share for participants.", "error");
    return;
  }
  const dialog = await showAppPrompt(
    "PUBLISH PROJECT",
    "Enter a name for the published project:",
    "CodX Project",
    "CodX Project",
  );
  if (!dialog?.ok) return;
  const projectName = String(dialog.value || "").trim() || "CodX Project";
  try {
    const response = await fetch("/api/publish", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        projectName,
        files: projectFiles,
        activeFileName: activeFile ? activeFile.name : "",
      }),
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok || !payload.ok) {
      throw new Error(payload.error || "Failed to publish project.");
    }
    if (payload.shareLink) {
      try {
        await navigator.clipboard.writeText(payload.shareLink);
      } catch (_err) {}
    }
    const dialog = await showAppPrompt(
      "PROJECT PUBLISHED",
      "Your project link is ready. It was copied to your clipboard if your browser allowed it.",
      payload.shareLink || "",
      payload.shareLink || "",
    );
    if (dialog?.ok && dialog.value && navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(dialog.value);
        showNotification("Published link copied.", "success");
      } catch (_err) {
        showNotification("Project published successfully.", "success");
      }
    } else {
      showNotification("Project published successfully.", "success");
    }
  } catch (error) {
    showNotification(error.message || "Failed to publish project.", "error");
  }
}

function renderProjectLibrary(mode = "saved") {
  if (!projectLibraryModal || !projectLibraryBody) return;
  if (activeSessionId && isReadOnlyParticipant()) {
    if (mode === "saved" && collabPermissions.disableOpenSavedProjects) {
      showNotification("The host disabled opening saved projects for participants.", "error");
      return;
    }
    if (mode === "templates" && collabPermissions.disableTemplates) {
      showNotification("The host disabled starter templates for participants.", "error");
      return;
    }
  }
  const savedProjects = getSavedProjects();
  const tabs = `
    <div class="collab-pill-row" style="margin-bottom:16px;">
      <button id="savedProjectsTabBtn" class="run-button"${mode === "saved" ? ' style="background:var(--accent-color);color:#fff;"' : ""}><strong>SAVED PROJECTS</strong></button>
      <button id="templateProjectsTabBtn" class="run-button"${mode === "templates" ? ' style="background:var(--accent-color);color:#fff;"' : ""}><strong>STARTER TEMPLATES</strong></button>
    </div>
  `;

  if (mode === "templates") {
    projectLibraryBody.innerHTML =
      tabs +
      `<div class="template-library-grid">${starterTemplates
        .map(
          (template) => `
            <article class="template-card" style="--template-accent:${escapeHtml(template.accent || "#4CAF50")};">
              <div class="template-card-top">
                <span class="template-icon"><i class="fa-solid ${escapeHtml(template.icon || "fa-layer-group")}"></i></span>
                <span class="template-tone">${escapeHtml(template.tone || "Starter")}</span>
              </div>
              <h4 class="template-title">${escapeHtml(template.name)}</h4>
              <div class="template-description">${escapeHtml(template.description)}</div>
              <div class="template-meta-row">
                <span class="template-meta-pill"><i class="fa-solid fa-folder-tree"></i> ${template.files.length} files</span>
                <span class="template-meta-pill"><i class="fa-solid fa-code"></i> ${escapeHtml(template.files.map((file) => file.type.toUpperCase()).join(" • "))}</span>
              </div>
              <div class="template-highlights">
                ${(Array.isArray(template.highlights) ? template.highlights : [])
                  .map((item) => `<span class="template-highlight-pill">${escapeHtml(item)}</span>`)
                  .join("")}
              </div>
              <button class="run-button apply-template-btn" data-template="${escapeHtml(template.id)}"><strong>USE TEMPLATE</strong></button>
            </article>`,
        )
        .join("")}</div>`;
  } else {
    projectLibraryBody.innerHTML =
      tabs +
      (savedProjects.length
        ? `<div class="collab-participant-list">${savedProjects
            .map(
              (project) => `
                <div class="collab-pending-row">
                  <div class="collab-participant-main">
                    <div class="collab-participant-text">
                      <div class="collab-participant-name">${escapeHtml(project.name)}</div>
                      <div class="collab-participant-meta">Updated ${new Date(project.updatedAt).toLocaleString()}</div>
                    </div>
                  </div>
                  <div class="collab-pending-actions">
                    <button class="run-button open-saved-project-btn" data-project-id="${escapeHtml(project.id)}"><strong>OPEN</strong></button>
                    <button class="run-button delete-saved-project-btn" data-project-id="${escapeHtml(project.id)}" style="background:#d32f2f;"><strong>DELETE</strong></button>
                  </div>
                </div>`,
            )
            .join("")}</div>`
        : `<div class="collab-section-card"><div class="collab-section-note">No saved projects yet. Use SAVE PROJECT to store your current work.</div></div>`);
  }

  projectLibraryModal.style.display = "flex";

  const savedTabBtn = document.getElementById("savedProjectsTabBtn");
  const templateTabBtn = document.getElementById("templateProjectsTabBtn");
  if (savedTabBtn) savedTabBtn.onclick = () => renderProjectLibrary("saved");
  if (templateTabBtn) templateTabBtn.onclick = () => renderProjectLibrary("templates");

  document.querySelectorAll(".open-saved-project-btn").forEach((btn) => {
    btn.onclick = () => {
      const project = savedProjects.find((entry) => entry.id === btn.dataset.projectId);
      if (!project?.snapshot) return;
      applyProjectState(project.snapshot, "saved project");
      closeProjectLibrary();
      showNotification(`Opened "${project.name}".`, "success");
    };
  });

  document.querySelectorAll(".delete-saved-project-btn").forEach((btn) => {
    btn.onclick = () => deleteSavedProject(btn.dataset.projectId);
  });

  document.querySelectorAll(".apply-template-btn").forEach((btn) => {
    btn.onclick = () => {
      const template = starterTemplates.find((entry) => entry.id === btn.dataset.template);
      if (!template) return;
      applyProjectState(
        {
          files: template.files,
          activeFileName: template.files[0]?.name || "",
          previewTarget: { mode: "html", fileName: template.files[0]?.name || "" },
        },
        "template",
      );
      closeProjectLibrary();
      showNotification(`Template "${template.name}" loaded.`, "success");
    };
  });
}

function closeProjectLibrary() {
  if (projectLibraryModal) {
    projectLibraryModal.style.display = "none";
  }
}

function tryRestoreAutosaveDraft() {
  const raw = safeLocalStorage("get", AUTOSAVE_PROJECT_KEY);
  if (!raw) return;
  try {
    const snapshot = JSON.parse(raw);
    if (Array.isArray(snapshot?.files) && snapshot.files.length) {
      applyProjectState(snapshot, "autosave");
      showNotification("Restored autosaved project draft.", "info");
    }
  } catch (_err) {}
}

function showNotification(message, type = "info") {
  if (
    activeSessionId &&
    collabPermissions.quietMode &&
    type !== "error" &&
    type !== "warn" &&
    !String(message || "").toLowerCase().includes("session")
  ) {
    return;
  }
  const existing = document.querySelectorAll(".codx-notification");
  existing.forEach((item, index) => {
    item.style.top = `${86 + index * 78}px`;
  });

  const notification = document.createElement("div");
  notification.className = `codx-notification codx-notification-${type}`;
  const offsetTop = 86 + existing.length * 78;
  notification.style.top = `${offsetTop}px`;

  const icon =
    type === "error"
      ? "fa-circle-exclamation"
      : type === "success"
      ? "fa-circle-check"
      : type === "warn"
      ? "fa-triangle-exclamation"
      : "fa-circle-info";

  const label =
    type === "error"
      ? "Error"
      : type === "success"
      ? "Success"
      : type === "warn"
      ? "Warning"
      : "Info";

  notification.innerHTML = `
    <div class="codx-notification-icon" aria-hidden="true">
      <i class="fa-solid ${icon}"></i>
    </div>
    <div class="codx-notification-body">
      <div class="codx-notification-label">${label}</div>
      <div class="codx-notification-message">${escapeHtml(String(message || ""))}</div>
    </div>
  `;
  document.body.appendChild(notification);
  setTimeout(() => {
    notification.classList.add("is-leaving");
    setTimeout(() => {
      notification.remove();
      document.querySelectorAll(".codx-notification").forEach((item, index) => {
        item.style.top = `${86 + index * 78}px`;
      });
    }, 300);
  }, 3000);
}

const consoleErrorObserver = new MutationObserver(() => {
  updateFileErrorCountsFromConsole();
});
if (consoleOutput) {
  consoleErrorObserver.observe(consoleOutput, {
    childList: true,
    subtree: false,
  });
}

function clearConsole() {
  consoleOutput.innerHTML = "";
  resetFileErrorCounts();
  renderFileList();
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

    const nameSpan = document.createElement("span");
    nameSpan.textContent = file.name;
    if (
      currentTypingIndicator &&
      currentTypingIndicator.name !== myInfo.name &&
      !collabPermissions.quietMode &&
      currentTypingIndicator.fileName === file.name
    ) {
      const typingSpan = document.createElement("span");
      typingSpan.className = "file-typing-indicator";
      typingSpan.textContent = ` - ${currentTypingIndicator.name} is typing...`;
      typingSpan.style.color = currentTypingIndicator.theme || "var(--accent-color)";
      nameSpan.appendChild(typingSpan);
    }

    if (collabPermissions.pinnedFile === file.name) {
      const pinnedSpan = document.createElement("span");
      pinnedSpan.className = "file-typing-indicator";
      pinnedSpan.textContent = " - PINNED";
      pinnedSpan.style.color = "var(--warning-color)";
      nameSpan.appendChild(pinnedSpan);
    }

    if (collabPermissions.groupHighlightFile === file.name) {
      const focusSpan = document.createElement("span");
      focusSpan.className = "file-typing-indicator";
      focusSpan.textContent = " - TEAM FOCUS";
      focusSpan.style.color = "var(--accent-color)";
      nameSpan.appendChild(focusSpan);
    }

    const errorCount = fileErrorCounts[file.name] || 0;
    if (errorCount > 0) {
      const errorBadge = document.createElement("span");
      errorBadge.className = "file-error-badge";
      errorBadge.textContent = errorCount > 99 ? "99+" : String(errorCount);
      errorBadge.title = `${errorCount} error${errorCount === 1 ? "" : "s"} - jump to ${errorCount === 1 ? "error" : "first error"}`;
      errorBadge.style.cssText = `
        display:inline-flex;
        align-items:center;
        justify-content:center;
        min-width:${errorCount > 99 ? "28px" : "18px"};
        height:18px;
        margin-left:8px;
        padding:0 5px;
        border-radius:999px;
        background:#e53935;
        color:#fff;
        font-size:11px;
        font-weight:700;
        line-height:1;
        cursor:pointer;
      `;
      errorBadge.setAttribute("role", "button");
      errorBadge.setAttribute("tabindex", "0");
      errorBadge.setAttribute(
        "aria-label",
        `Jump to ${errorCount} error${errorCount === 1 ? "" : "s"} in ${file.name}`,
      );
      const jumpToError = (e) => {
        e.preventDefault();
        e.stopPropagation();
        jumpToFirstErrorInFile(file.name);
      };
      errorBadge.addEventListener("click", jumpToError);
      errorBadge.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          jumpToError(e);
        }
      });
      nameSpan.appendChild(errorBadge);
    }

    const renameBtn = document.createElement("button");
    renameBtn.className = "rename-file";
    renameBtn.dataset.file = file.name;
    renameBtn.setAttribute("aria-label", `Rename ${file.name}`);

    const pencilIcon = document.createElement("i");
    pencilIcon.className = "fa-solid fa-pen";
    renameBtn.appendChild(pencilIcon);

    const deleteBtn = document.createElement("button");
    deleteBtn.className = "delete-file";
    deleteBtn.dataset.file = file.name;
    deleteBtn.setAttribute("aria-label", `Delete ${file.name}`);

    const trashIcon = document.createElement("i");
    trashIcon.className = "fa-solid fa-trash";
    deleteBtn.appendChild(trashIcon);

    fileItem.appendChild(nameSpan);
    fileItem.appendChild(renameBtn);
    fileItem.appendChild(deleteBtn);

    fileItem.addEventListener("click", (e) => {
      if (e.target.closest(".delete-file") || e.target.closest(".rename-file"))
        return;
      switchFile(file.name);
    });
    renameBtn.addEventListener("click", () => renameFile(file.name));
    deleteBtn.addEventListener("click", () => deleteFile(file.name));
    fileList.appendChild(fileItem);
  });
  enforceCollabPermissionsUI();
}

function switchFile(fileName) {
  const previousPreviewTarget = { ...currentPreviewTarget };
  const normalizedFileName = String(fileName || "").trim().toLowerCase();
  projectFiles.forEach((file) => {
    file.active = String(file.name || "").trim().toLowerCase() === normalizedFileName;
    if (file.active) {
      activeFile = file;
      const editor = document.getElementById("activeEditor");
      editor.value = file.content;
      updateLineNumbers(editor);
      syncScroll(editor);
      // Hide suggestions when switching files
      hideSuggestions();
    }
  });
  if (activeFile && activeFile.type === "html") {
    currentPreviewTarget = { mode: "html", fileName: activeFile.name };
  } else {
    currentPreviewTarget = previousPreviewTarget;
  }
  renderFileList();
  enforceCollabPermissionsUI();
  if (autoRunCheckbox.checked) updatePreview();
  syncProjectWithSession();
}

async function createNewFile() {
  if (activeSessionId && isReadOnlyParticipant() && collabPermissions.disableNewFile) {
    showNotification("The host disabled creating new files for participants.", "error");
    return;
  }
  const dialog = await showAppPrompt(
    "NEW FILE",
    "Enter file name (e.g., newfile.html or .env):",
    "",
    "newfile.html",
  );
  if (!dialog?.ok) return;
  const name = dialog.value;
  if (!name) return;
  const trimmedName = name.trim();
  if (!trimmedName) return;
  const ext = trimmedName.split(".").pop().toLowerCase();

  if (!editableTextExtensions.includes(ext)) {
    showNotification("File must be .html, .css, .js, or .env", "error");
    return;
  }
  if (projectFiles.some((file) => file.name.toLowerCase() === trimmedName.toLowerCase())) {
    showNotification("File name already exists", "error");
    return;
  }

  // Define the default HTML template
  const newFile = {
    name: trimmedName,
    type: ext,
    // Use template for HTML files, otherwise empty string
    content: ext === "html" ? getDefaultHtmlStarter() : "",
    active: true,
  };

  projectFiles.forEach((file) => (file.active = false));
  projectFiles.push(newFile);
  activeFile = newFile;
  if (newFile.type === "html") {
    currentPreviewTarget = { mode: "html", fileName: newFile.name };
  }

  const editor = document.getElementById("activeEditor");
  editor.value = newFile.content; // Set editor value to the template
  updateLineNumbers(editor);
  renderFileList();
  scheduleProjectAutosave();
  if (autoRunCheckbox.checked) updatePreview();
  syncProjectWithSession();
  showNotification(`File ${trimmedName} created`, "success");
}

async function renameFile(oldName) {
  const normalizedOldName = String(oldName || "").trim().toLowerCase();
  const file = projectFiles.find(
    (f) => String(f.name || "").trim().toLowerCase() === normalizedOldName,
  );
  if (!file) return;

  const dialog = await showAppPrompt(
    "RENAME FILE",
    "Enter the new file name:",
    oldName,
    oldName,
  );
  if (!dialog?.ok) return;
  const nextName = dialog.value;
  if (!nextName) return;
  const name = nextName.trim();
  if (!name || name === oldName) return;

  const ext = name.split(".").pop().toLowerCase();
  if (!editableTextExtensions.includes(ext)) {
    showNotification("File must be .html, .css, .js, or .env", "error");
    return;
  }
  if (
    projectFiles.some(
      (f) =>
        String(f.name || "").trim().toLowerCase() === name.toLowerCase() &&
        String(f.name || "").trim().toLowerCase() !== normalizedOldName,
    )
  ) {
    showNotification("File name already exists", "error");
    return;
  }

  const previousType = file.type;
  file.name = name;
  file.type = ext;
  if (
    currentPreviewTarget.mode === "html" &&
    currentPreviewTarget.fileName &&
    currentPreviewTarget.fileName.toLowerCase() === oldName.toLowerCase()
  ) {
    currentPreviewTarget = { mode: "html", fileName: name };
  }

  if (activeFile && activeFile === file) {
    hideSuggestions();
    const editor = document.getElementById("activeEditor");
    if (editor) {
      updateLineNumbers(editor);
    }
  }

  renderFileList();
  scheduleProjectAutosave();
  syncProjectWithSession();
  showNotification(`File renamed to ${name}`, "success");
  if (autoRunCheckbox.checked || previousType !== ext) {
    updatePreview();
  }
}

async function deleteFile(fileName) {
  if (projectFiles.length <= 1) {
    showNotification("Cannot delete the last file", "error");
    return;
  }
  const dialog = await showAppConfirm(
    "DELETE FILE",
    `Delete ${fileName}?`,
    "DELETE",
    "CANCEL",
    "background:#d32f2f;",
  );
  if (dialog?.ok) {
    const normalizedFileName = String(fileName || "").trim().toLowerCase();
    projectFiles = projectFiles.filter(
      (file) => String(file.name || "").trim().toLowerCase() !== normalizedFileName,
    );
    if (
      activeFile &&
      String(activeFile.name || "").trim().toLowerCase() === normalizedFileName
    ) {
      activeFile = projectFiles[0];
      activeFile.active = true;
      const editor = document.getElementById("activeEditor");
      editor.value = activeFile.content;
      updateLineNumbers(editor);
      syncScroll(editor);
    }
    if (
      currentPreviewTarget.fileName &&
      currentPreviewTarget.fileName.toLowerCase() === fileName.toLowerCase()
    ) {
      const nextHtmlFile = projectFiles.find((file) => file.type === "html");
      currentPreviewTarget = nextHtmlFile
        ? { mode: "html", fileName: nextHtmlFile.name }
        : { mode: "html", fileName: "" };
    }
    renderFileList();
    scheduleProjectAutosave();
    syncProjectWithSession();
    updatePreview();
    showNotification(`File ${fileName} deleted`, "success");
  }
}

// PART 3 - SETTINGS MANAGEMENT
function loadSettings() {
  const savedSettings = safeLocalStorage("get", "editorSettings");
  if (savedSettings) {
    try {
      const settings = JSON.parse(savedSettings);
      editorBgColorInput.value = settings.bgColor;
      editorBgColorText.value = settings.bgColor;
      editorTextSizeInput.value = settings.textSize;
      textSizeValue.textContent = settings.textSize + "px";
      editorFontFamilySelect.value = settings.fontFamily;
      if (!editorFontFamilySelect.value) {
        editorFontFamilySelect.value = defaultSettings.fontFamily;
      }
      editorFontEmbedInput.value = settings.fontEmbed || "";
    } catch (e) {
      console.error("Error loading settings:", e);
      resetToDefaultSettings();
    }
  } else {
    resetToDefaultSettings();
  }
  updateFontControlsState();
  updatePreviewBox();
  applySettingsToEditors();
}

function resetToDefaultSettings() {
  editorBgColorInput.value = defaultSettings.bgColor;
  editorBgColorText.value = defaultSettings.bgColor;
  editorTextSizeInput.value = defaultSettings.textSize;
  textSizeValue.textContent = defaultSettings.textSize + "px";
  editorFontFamilySelect.value = defaultSettings.fontFamily;
  editorFontEmbedInput.value = defaultSettings.fontEmbed;
  applyGoogleFontImport("");
  updateFontControlsState();
}

function extractGoogleFontsCssUrl(rawInput) {
  const raw = String(rawInput || "").trim();
  if (!raw) return "";

  const hrefMatch = raw.match(/href=["'](https:\/\/fonts\.googleapis\.com\/css2?[^"']+)["']/i);
  if (hrefMatch) return hrefMatch[1];

  const importMatch = raw.match(/@import\s+url\((['"]?)(https:\/\/fonts\.googleapis\.com\/css2?[^'")\s]+)\1\)/i);
  if (importMatch) return importMatch[2];

  const directMatch = raw.match(/https:\/\/fonts\.googleapis\.com\/css2?[^\s"'<>)]*/i);
  if (directMatch) return directMatch[0];

  return "";
}

function getGoogleFontFamilyName(cssUrl) {
  try {
    const url = new URL(cssUrl);
    const families = url.searchParams.getAll("family");
    if (!families.length) return "";
    const first = decodeURIComponent(families[0]).replace(/\+/g, " ");
    return first.split(":")[0].trim();
  } catch {
    return "";
  }
}

function applyGoogleFontImport(cssUrl) {
  let styleEl = document.getElementById("editorGoogleFontImport");
  if (!cssUrl) {
    if (styleEl) styleEl.remove();
    return;
  }

  if (!styleEl) {
    styleEl = document.createElement("style");
    styleEl.id = "editorGoogleFontImport";
    document.head.appendChild(styleEl);
  }
  styleEl.textContent = `@import url("${cssUrl}");`;
}

function getEffectiveEditorFontFamily() {
  const cssUrl = extractGoogleFontsCssUrl(editorFontEmbedInput.value);
  if (cssUrl) {
    applyGoogleFontImport(cssUrl);
    const familyName = getGoogleFontFamilyName(cssUrl);
    if (familyName) {
      return `'${familyName.replace(/'/g, "\\'")}', 'JetBrains Mono', 'Consolas', monospace`;
    }
  }
  return editorFontFamilySelect.value || defaultSettings.fontFamily;
}

function updateFontControlsState() {
  const hasGoogleEmbed = Boolean(extractGoogleFontsCssUrl(editorFontEmbedInput.value));
  editorFontFamilySelect.disabled = hasGoogleEmbed;
  editorFontFamilySelect.title = hasGoogleEmbed
    ? "Disabled because a Google Fonts embed link is active."
    : "";
}

function updatePreviewBox() {
  settingsPreview.style.backgroundColor = editorBgColorInput.value;
  settingsPreview.style.fontSize = editorTextSizeInput.value + "px";
  settingsPreview.style.fontFamily = getEffectiveEditorFontFamily();
  settingsPreviewCode.style.fontSize = editorTextSizeInput.value + "px";
  settingsPreviewCode.style.fontFamily = getEffectiveEditorFontFamily();
  settingsPreviewCode.innerHTML = highlightJs(settingsPreviewSampleCode);
}

function applySettingsToEditors() {
  const editor = document.getElementById("activeEditor");
  if (!editor) return;
  const editorWrapper = editor.closest(".editor-wrapper");
  const selectedBg = editorBgColorInput.value || defaultSettings.bgColor;

  editor.style.fontSize = editorTextSizeInput.value + "px";
  editor.style.fontFamily = getEffectiveEditorFontFamily();
  editor.style.backgroundColor = "transparent";
  if (editorWrapper) {
    editorWrapper.style.backgroundColor = selectedBg;
  }
  if (highlightLayer) {
    highlightLayer.style.backgroundColor = selectedBg;
  }
  lineNumbers.style.fontSize = editorTextSizeInput.value + "px";
  syncSyntaxLayerStyle(editor);
  renderSyntaxHighlight(editor);
}

editorBgColorInput.addEventListener("input", (e) => {
  editorBgColorText.value = e.target.value;
  updatePreviewBox();
});

// Allow manual hex code input for background color
editorBgColorText.addEventListener("input", (e) => {
  const hexValue = e.target.value;
  // Validate hex color format
  if (/^#[0-9A-Fa-f]{6}$/.test(hexValue)) {
    editorBgColorInput.value = hexValue;
    updatePreviewBox();
  }
});

editorTextSizeInput.addEventListener("input", (e) => {
  textSizeValue.textContent = e.target.value + "px";
  updatePreviewBox();
});

editorFontFamilySelect.addEventListener("change", updatePreviewBox);
editorFontEmbedInput.addEventListener("input", () => {
  updateFontControlsState();
  updatePreviewBox();
});

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
  const cssUrl = extractGoogleFontsCssUrl(editorFontEmbedInput.value);
  if (editorFontEmbedInput.value.trim() && !cssUrl) {
    showNotification("Invalid Google Fonts embed link. Paste a valid fonts.googleapis.com URL.", "error");
    return;
  }

  applyGoogleFontImport(cssUrl);
  if (cssUrl) {
    editorFontEmbedInput.value = cssUrl;
  }
  updateFontControlsState();

  const settings = {
    bgColor: editorBgColorInput.value,
    textSize: editorTextSizeInput.value,
    fontFamily: editorFontFamilySelect.value,
    fontEmbed: cssUrl || "",
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
  showAppConfirm(
    "RESET SETTINGS",
    "Are you sure you want to reset all settings to default?",
    "RESET",
    "CANCEL",
    "background:#d32f2f;",
  ).then((dialog) => {
    if (!dialog?.ok) return;
    safeLocalStorage("remove", "editorSettings");
    resetToDefaultSettings();
    updatePreviewBox();
    applySettingsToEditors();
    showNotification("Settings reset to default!", "success");
  });
});

// PART 4 - UI CONTROLS
showConsoleCheckbox.addEventListener("change", () => {
  if (showConsoleCheckbox.disabled) {
    showConsoleCheckbox.checked = false;
    return;
  }
  consoleContainer.classList.toggle("show", showConsoleCheckbox.checked);
});

// PART 5 - PREVIEW & LINE NUMBERS
function getErrorHint(message) {
  const msg = String(message || "").toLowerCase();
  if (msg.includes("unexpected token"))
    return "Check for missing commas, brackets, or quotes near this line.";
  if (msg.includes("missing )"))
    return "A closing parenthesis ')' is likely missing.";
  if (msg.includes("missing ]"))
    return "A closing bracket ']' is likely missing.";
  if (msg.includes("missing }"))
    return "A closing brace '}' is likely missing.";
  if (msg.includes("is not defined"))
    return "Declare the variable/function before using it.";
  if (msg.includes("cannot read properties of"))
    return "Check if the value is null/undefined before property access.";
  if (msg.includes("unterminated string"))
    return "Close your string with matching quotes.";
  return "Review syntax near the reported line.";
}

function runPreflightDiagnostics() {
  // JS syntax checks per JS file
  projectFiles
    .filter((f) => f.type === "js")
    .forEach((file) => {
      try {
        // Parse-only check
        new Function(`${file.content}\n//# sourceURL=${file.name}`);
      } catch (err) {
        const stack = String(err && err.stack ? err.stack : "");
        const lineMatch = stack.match(/<anonymous>:(\d+):(\d+)/);
        const lineInfo = lineMatch
          ? `line ${lineMatch[1]}, col ${lineMatch[2]}`
          : "line unknown";
        appendConsoleMessage(
          "error",
          `[${file.name}] SyntaxError (${lineInfo}): ${err.message}. Fix: ${getErrorHint(err.message)}`,
        );
      }
    });

  // Basic CSS braces check
  projectFiles
    .filter((f) => f.type === "css")
    .forEach((file) => {
      const text = file.content || "";
      const normalizedText = text.replace(
        /\/\*[\s\S]*?\*\/|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'/g,
        (match) => " ".repeat(match.length),
      );
      let depth = 0;
      const openBraceLines = [];
      for (let i = 0; i < normalizedText.length; i++) {
        if (normalizedText[i] === "{") {
          depth++;
          openBraceLines.push(text.slice(0, i).split("\n").length);
        }
        if (normalizedText[i] === "}") {
          depth--;
          if (openBraceLines.length) {
            openBraceLines.pop();
          }
        }
        if (depth < 0) {
          const line = text.slice(0, i).split("\n").length;
          appendConsoleMessage(
            "error",
            `[${file.name}] CSS issue at line ${line}: extra '}' found.`,
          );
          return;
        }
      }
      if (depth > 0) {
        const line = openBraceLines[openBraceLines.length - 1] || 1;
        appendConsoleMessage(
          "error",
          `[${file.name}] CSS issue at line ${line}: missing closing '}' brace.`,
        );
      }
    });

  // Basic HTML checks for every HTML file in the project.
  const selfClosing = new Set([
    "area",
    "base",
    "br",
    "col",
    "embed",
    "hr",
    "img",
    "input",
    "link",
    "meta",
    "param",
    "source",
    "track",
    "wbr",
  ]);

  projectFiles
    .filter((f) => f.type === "html")
    .forEach((htmlFile) => {
      const htmlText = htmlFile.content || "";

      const inlineScriptRegex = /<script\b(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/gi;
      let scriptMatch;
      while ((scriptMatch = inlineScriptRegex.exec(htmlText)) !== null) {
        const scriptCode = scriptMatch[1];
        const scriptStartLine = htmlText.slice(0, scriptMatch.index).split("\n").length;
        try {
          new Function(`${scriptCode}\n//# sourceURL=${htmlFile.name}`);
        } catch (err) {
          const stack = String(err && err.stack ? err.stack : "");
          const lineMatch = stack.match(/<anonymous>:(\d+):(\d+)/);
          if (lineMatch) {
            const relLine = Number(lineMatch[1]);
            const col = Number(lineMatch[2]);
            const absLine = scriptStartLine + Math.max(0, relLine - 1);
            appendConsoleMessage(
              "error",
              `[${htmlFile.name}] Inline JS SyntaxError (line ${absLine}, col ${col}): ${err.message}. Fix: ${getErrorHint(err.message)}`,
            );
          } else {
            appendConsoleMessage(
              "error",
              `[${htmlFile.name}] Inline JS SyntaxError: ${err.message}. Fix: ${getErrorHint(err.message)}`,
            );
          }
        }
      }

      const stack = [];
      const re = /<\/?([a-zA-Z][a-zA-Z0-9-]*)\b[^>]*>/g;
      let match;
      while ((match = re.exec(htmlText)) !== null) {
        const full = match[0];
        const tag = match[1].toLowerCase();
        if (selfClosing.has(tag) || full.endsWith("/>")) continue;
        const location = getLineAndColumnFromIndex(htmlText, match.index);
        const line = location.line;
        const col = location.col;
        const isCustomElement = tag.includes("-");

        if (!isCustomElement && !knownHtmlTags.has(tag)) {
          appendConsoleMessage(
            "error",
            `[${htmlFile.name}] HTML issue at line ${line}:${col}: unknown tag <${tag}>. Check for a misspelled HTML tag.`,
          );
          continue;
        }

        if (full.startsWith("</")) {
          const last = stack.pop();
          if (!last || last.tag !== tag) {
            appendConsoleMessage(
              "error",
              `[${htmlFile.name}] HTML issue at line ${line}:${col}: mismatched closing tag </${tag}>.`,
            );
            break;
          }
        } else {
          stack.push({ tag, line, col });
        }
      }

      if (stack.length) {
        const unclosed = stack[stack.length - 1];
        appendConsoleMessage(
          "error",
          `[${htmlFile.name}] HTML issue at line ${unclosed.line}:${unclosed.col}: unclosed <${unclosed.tag}> tag.`,
        );
      }
    });
}

function updatePreview() {
  if (activeSessionId && isReadOnlyParticipant() && collabPermissions.disableRunCode) {
    showNotification("The host disabled running code for participants.", "error");
    return;
  }
  consoleOutput.innerHTML = "";
  resetFileErrorCounts();
  renderFileList();
  runPreflightDiagnostics();

  if (currentPreviewTarget.mode === "empty") {
    updatePreviewTitle("Preview");
    updatePreviewLink("");
    updatePreviewFavicon("");
    iframe.srcdoc =
      '<h3 style="text-align:center;color:#aaa;">No HTML file found</h3>';
    appendConsoleMessage("warn", "WARNING: No HTML target was provided for preview navigation.");
    return;
  }

  if (currentPreviewTarget.mode === "missing" && currentPreviewTarget.fileName) {
    const recoveredTarget = getPreviewTargetForFile(currentPreviewTarget.fileName);
    if (recoveredTarget.exists) {
      currentPreviewTarget = {
        mode: "html",
        fileName: recoveredTarget.fileName,
      };
    } else {
      updatePreviewTitle(currentPreviewTarget.fileName || "Preview");
      updatePreviewLink(currentPreviewTarget.fileName || "");
      updatePreviewFavicon("");
      iframe.src = `/404-for-preview.html?file=${encodeURIComponent(currentPreviewTarget.fileName)}`;
      appendConsoleMessage(
        "warn",
        `WARNING: Preview page not found: ${currentPreviewTarget.fileName}`,
      );
      return;
    }
  }

  let htmlFile = null;
  if (currentPreviewTarget.mode === "html" && currentPreviewTarget.fileName) {
    htmlFile =
      projectFiles.find(
        (f) =>
          f.type === "html" &&
          f.name.toLowerCase() === currentPreviewTarget.fileName.toLowerCase(),
      ) || null;
  }
  if (!htmlFile) {
    htmlFile = projectFiles.find((f) => f.type === "html");
    if (htmlFile) {
      currentPreviewTarget = { mode: "html", fileName: htmlFile.name };
    }
  }
  if (!htmlFile) {
    updatePreviewTitle("Preview");
    updatePreviewLink("");
    updatePreviewFavicon("");
    iframe.srcdoc =
      '<h3 style="text-align:center;color:#aaa;">No HTML file found</h3>';
    return;
  }

  let html = htmlFile.content;
  updatePreviewTitle(extractHtmlTitle(html) || htmlFile.name);
  updatePreviewLink(htmlFile.name);
  updatePreviewFavicon(resolvePreviewAssetPath(extractHtmlFavicon(html)));
  const externalHeadResources = [];

  // Normalize external font/resource links into <head> so they reliably load in srcdoc.
  html = html.replace(/<link\b[^>]*>/gi, (match) => {
    const hrefMatch =
      match.match(/\bhref=["']([^"']+)["']/i) ||
      match.match(/\bhref=([^\s>]+)/i);
    const relMatch =
      match.match(/\brel=["']([^"']+)["']/i) ||
      match.match(/\brel=([^\s>]+)/i);

    if (!hrefMatch) return match;

    const href = (hrefMatch[1] || "").trim();
    const rel = (relMatch ? relMatch[1] : "").trim().toLowerCase();
    const isExternal = /^(https?:)?\/\//i.test(href);
    const isGoogleFonts = /^https:\/\/fonts\.googleapis\.com\//i.test(href);
    const isFontHint =
      /^https:\/\/fonts\.gstatic\.com\//i.test(href) ||
      /^https:\/\/fonts\.googleapis\.com\//i.test(href);

    if (!isExternal) return match;

    if (rel === "stylesheet" && isGoogleFonts) {
      externalHeadResources.push(`<style>@import url("${href}");</style>`);
      return "";
    }

    if (rel === "preconnect" || rel === "dns-prefetch" || isFontHint) {
      externalHeadResources.push(match);
      return "";
    }

    return match;
  });

  // === 1. Replace <link rel="stylesheet" href="style.css"> (handles both attribute orders)
  html = html.replace(
    /<link[^>]*(?:rel=["']stylesheet["'][^>]*href=["']([^"']+)["']|href=["']([^"']+)["'][^>]*rel=["']stylesheet["'])[^>]*\/?>/gi,
    (match, href1, href2) => {
      const href = (href1 || href2 || "").trim();
      if (/^(https?:)?\/\//i.test(href)) {
        return match;
      }
      const normalizedHref = href.replace(/^\.\/+/, "").toLowerCase();
      const hrefFileName = normalizedHref.split("/").pop();
      const cssFile = projectFiles.find(
        (f) => {
          if (f.type !== "css") return false;
          const candidate = String(f.name || "").trim().replace(/^\.\/+/, "").toLowerCase();
          return (
            candidate === normalizedHref ||
            candidate.endsWith(`/${normalizedHref}`) ||
            candidate.split("/").pop() === hrefFileName
          );
        },
      );
      if (cssFile) {
        return `<style>${cssFile.content}</style>`;
      } else {
        const fileName = href.split("/").pop();
        appendConsoleMessage(
          "warn",
          `WARNING: CSS file not found: ${fileName}`,
        );
        return match; // Keep original link tag
      }
    },
  );

  // === 2. Replace <script src="script.js"></script> WITH FILE NAME MARKERS
  html = html.replace(
    /<script[^>]*src=["']([^"']+)["'][^>]*><\/script>/gi,
    (match, src) => {
      const normalizedSrc = String(src || "").trim();
      // Preserve external scripts exactly (including API-key query params).
      if (
        /^(https?:)?\/\//i.test(normalizedSrc) ||
        normalizedSrc.startsWith("data:") ||
        normalizedSrc.startsWith("blob:")
      ) {
        return match;
      }

      const resolvedSrc = normalizedSrc.replace(/^\.\/+/, "").toLowerCase();
      const srcFileName = resolvedSrc.split("/").pop();
      const jsFile = projectFiles.find(
        (f) => {
          if (f.type !== "js") return false;
          const candidate = String(f.name || "").trim().replace(/^\.\/+/, "").toLowerCase();
          return (
            candidate === resolvedSrc ||
            candidate.endsWith(`/${resolvedSrc}`) ||
            candidate.split("/").pop() === srcFileName
          );
        },
      );
      if (jsFile) {
        // Keep original file line numbers by not wrapping code in extra lines.
        return `<script data-filename="${jsFile.name}">
${jsFile.content}
//# sourceURL=${jsFile.name}
</script>`;
      } else {
        const fileName = src.split("/").pop();
        appendConsoleMessage("warn", `WARNING: JS file not found: ${fileName}`);
        return match;
      }
    },
  );

  // === 3. Handle <a href> links to other HTML files and preview-only missing anchors
  html = html.replace(
    /<a([^>]*)href=["']([^"']+)["']([^>]*)>/gi,
    (match, before, href, after) => {
      const normalizedHref = String(href || "").trim();
      if (!/\.html$/i.test(normalizedHref) && normalizedHref !== "#") {
        return match;
      }
      const target = getPreviewTargetForFile(href);
      if (normalizedHref === "#" || !target.exists) {
        return `<a${before}href="${target.url}"${after}>`;
      }
      return `<a${before}href="javascript:void(0)" onclick="return window.parent.__codxOpenPreviewFile('${target.fileName}')"${after}>`;
    },
  );

  // === 3a. Handle <form action> navigation to project HTML files
  html = html.replace(
    /<form([^>]*)action=["']([^"']+\.html)["']([^>]*)>/gi,
    (match, before, action, after) => {
      const target = getPreviewTargetForFile(action);
      if (!target.exists) {
        return `<form${before}action="${target.url}"${after}>`;
      }
      const combinedAttrs = `${before}${after}`;
      const onsubmitMatch = combinedAttrs.match(/\bonsubmit=(["'])([\s\S]*?)\1/i);
      const existingOnsubmit = onsubmitMatch ? onsubmitMatch[2].trim() : "";
      const cleanedAttrs = combinedAttrs.replace(/\s*\bonsubmit=(["'])[\s\S]*?\1/i, "");
      const handlerParts = [];
      if (existingOnsubmit) {
        handlerParts.push(existingOnsubmit.replace(/;?\s*$/, ""));
      }
      handlerParts.push("event.preventDefault()");
      handlerParts.push(`return window.parent.__codxOpenPreviewFile('${target.fileName}')`);
      return `<form${cleanedAttrs} action="javascript:void(0)" onsubmit="${handlerParts.join("; ")}">`;
    },
  );

  // === 3b. Handle inline onclick/location assignments to project HTML files
  html = html.replace(
    /\bonclick=(["'])([\s\S]*?)\1/gi,
    (match, quote, handlerCode) => {
      const rewritten = handlerCode.replace(
        /((?:window\.)?location(?:\.href)?\s*=\s*|window\.location\.assign\(\s*|window\.open\(\s*)(['"])([^'"]+\.html)(\2)(\s*\))?/gi,
        (_m, prefix, q, href, _q2, closing = "") => {
          const target = getPreviewTargetForFile(href);
          if (!target.exists) {
            if (/window\.open\(\s*$/i.test(prefix)) {
              return `window.open(${q}${target.url}${q}${closing || ")"})`;
            }
            if (/assign\(\s*$/i.test(prefix)) {
              return `window.location.assign(${q}${target.url}${q}${closing || ")"})`;
            }
            return `window.location.href = ${q}${target.url}${q}`;
          }
          return `window.parent.__codxOpenPreviewFile(${q}${target.fileName}${q})`;
        },
      );
      return `onclick=${quote}${rewritten}${quote}`;
    },
  );

  // === 3. Handle media: <img>, <video>, <audio>, <source> src attributes
  const resolveMediaFile = (srcValue) => {
    const normalizedSrc = (srcValue || "").trim().toLowerCase();
    const srcFileName = normalizedSrc.split("/").pop();
    return projectFiles.find((f) => {
      if (f.type !== "media") return false;
      const fileName = (f.name || "").toLowerCase();
      return fileName === normalizedSrc || fileName === srcFileName;
    });
  };

  html = html.replace(
    /<(img|video|audio|source)([^>]*)src=["']([^"']+)["']([^>]*)>/gi,
    (match, tag, before, src, after) => {
      // Check if it's a data URL, external URL (http/https), or local file
      if (
        src.startsWith("data:") ||
        src.startsWith("http://") ||
        src.startsWith("https://") ||
        src.startsWith("blob:")
      ) {
        // Keep external URLs and data URLs as-is
        return match;
      }

      // Try to find the media file in projectFiles
      const mediaFile = resolveMediaFile(src);
      if (mediaFile && mediaFile.content) {
        return `<${tag}${before} src="${mediaFile.content}"${after}>`;
      } else {
        // File not found in project - it might be in the same directory or external
        // Just keep the original src
        return match;
      }
    },
  );

  // === 4. Inject console override BEFORE any scripts
  const consoleScript = `
    <script>
      (function() {
        try {
          const CODEX_HTML_FILE = ${JSON.stringify(htmlFile.name)};
          const CODEX_INJECTED_OFFSET = __CODEX_INJECTED_OFFSET__;
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

          function suggestFix(message) {
            const msg = String(message || '').toLowerCase();
            if (msg.includes('unexpected token')) return 'Check missing commas, quotes, or brackets.';
            if (msg.includes('is not defined')) return 'Declare the variable/function before use.';
            if (msg.includes('cannot read properties of')) return 'Guard against null/undefined values.';
            if (msg.includes('missing')) return 'A closing bracket/brace/parenthesis may be missing.';
            return 'Review code around this line.';
          }

          function parseStackLocation(error) {
            if (!error || !error.stack) return null;
            const stack = String(error.stack);
            // Prefer explicit source files (e.g. script.js:8:1)
            let m = stack.match(/\\b([A-Za-z0-9_.-]+\\.(?:js|mjs|html)):(\\d+):(\\d+)\\b/);
            if (m) {
              return { file: m[1], line: Number(m[2]), col: Number(m[3]) };
            }
            // Fallback to srcdoc/anonymous frames
            m = stack.match(/\\b(?:about:srcdoc|<anonymous>|eval):?(\\d+):(\\d+)\\b/);
            if (m) {
              return { file: null, line: Number(m[1]), col: Number(m[2]) };
            }
            return null;
          }

          function normalizeFilename(source, error) {
            const loc = parseStackLocation(error);
            if (loc && loc.file) return loc.file;
            if (source && !source.startsWith('about:srcdoc') && !source.startsWith('data:text/html')) {
              return source.split('/').pop();
            }
            return CODEX_HTML_FILE;
          }

          function normalizeLine(source, line, error) {
            const loc = parseStackLocation(error);
            if (loc && loc.file) return loc.line;
            // If error came from srcdoc/html, subtract injected lines
            if (source && (source.startsWith('about:srcdoc') || source.startsWith('data:text/html'))) {
              return Math.max(1, Number(line || 1) - Number(CODEX_INJECTED_OFFSET || 0));
            }
            if (loc && !loc.file) {
              return Math.max(1, Number(loc.line || 1) - Number(CODEX_INJECTED_OFFSET || 0));
            }
            return Number(line || 1);
          }

          function normalizeCol(source, col, error) {
            const loc = parseStackLocation(error);
            if (loc) return Number(loc.col || col || 1);
            return Number(col || 1);
          }

          // Override console methods IMMEDIATELY
          console.log = function(...args) { appendMessage('log', '> ', args); };
          console.warn = function(...args) { appendMessage('warn', 'WARNING: ', args); };
          console.error = function(...args) { appendMessage('error', 'ERROR: ', args); };
          console.info = function(...args) { appendMessage('info', 'INFO: ', args); };

          // Capture runtime errors
          window.onerror = function(msg, source, line, col, error) {
            const filename = normalizeFilename(source || '', error);
            const mappedLine = normalizeLine(source || '', line, error);
            const mappedCol = normalizeCol(source || '', col, error);
            const fix = suggestFix(msg);
            appendMessage('error', 'Error: ', ['[' + filename + '] line ' + mappedLine + ':' + mappedCol + ' - ' + msg + ' | Fix: ' + fix]);
            return false;
          };

          // Capture unhandled promise rejections
          window.addEventListener('unhandledrejection', function(e) {
            const reason = e && e.reason;
            const message =
              reason && typeof reason === 'object' && 'message' in reason
                ? reason.message
                : String(reason || 'Unknown promise rejection');
            const filename = normalizeFilename('', reason);
            const mappedLine = normalizeLine('', 1, reason);
            const mappedCol = normalizeCol('', 1, reason);
            const fix = suggestFix(message);
            appendMessage(
              'error',
              'Promise rejected: ',
              ['[' + filename + '] line ' + mappedLine + ':' + mappedCol + ' - ' + message + ' | Fix: ' + fix],
            );
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

  // === 5. Inject image sizing CSS to ensure proper display
  const imageSizingCSS = `
    <style>
      /* Prevent images from overflowing their containers */
      img {
        max-width: 100%;
        height: auto;
        display: block;
      }
      
      /* If images have explicit width/height attributes, respect them but constrain to container */
      img[width]:not([width=""]):not([width="auto"]),
      img[height]:not([height=""]):not([height="auto"]) {
        max-width: 100%;
        height: auto;
      }
      
      /* Ensure video and audio don't overflow */
      video, audio {
        max-width: 100%;
      }
    </style>
  `;

  // Insert console script and image CSS at the very beginning
  const injectionContent = imageSizingCSS + consoleScript;
  const injectedOffset = injectionContent.split("\n").length;
  const consoleScriptResolved = consoleScript.replace(
    "__CODEX_INJECTED_OFFSET__",
    String(injectedOffset),
  );
  const externalHeadMarkup = Array.from(new Set(externalHeadResources)).join("");
  const injectionResolved =
    externalHeadMarkup + imageSizingCSS + consoleScriptResolved;

  if (/<head[^>]*>/i.test(html)) {
    html = html.replace(/(<head[^>]*>)/i, `$1${injectionResolved}`);
  } else if (/<html[^>]*>/i.test(html)) {
    html = html.replace(/(<html[^>]*>)/i, `$1${injectionResolved}`);
  } else if (/<body[^>]*>/i.test(html)) {
    html = html.replace(/(<body[^>]*>)/i, `${injectionResolved}$1`);
  } else {
    // No proper HTML structure, prepend it
    html = injectionResolved + html;
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
  if (type === "error") {
    updateFileErrorCountsFromConsole();
  }
}

// Line numbers
function updateLineNumbers(textarea) {
  if (!textarea) textarea = document.getElementById("activeEditor");
  if (!textarea) return;
  const lines = textarea.value.split("\n").length;
  lineNumbers.textContent = Array.from({ length: lines }, (_, i) => i + 1).join(
    "\n",
  );
  renderSyntaxHighlight(textarea);
  renderErrorHighlights(textarea);
  renderEditorWatermark(textarea);
}

function renderEditorWatermark(textarea) {
  if (!editorWatermark || !textarea || !activeFile) return;
  const shouldShow =
    activeFile.type === "html" && String(textarea.value || "").trim() === "";
  editorWatermark.style.display = shouldShow ? "block" : "none";
}

function commitEditorMutation(editor) {
  if (!editor || !activeFile) return;
  hasUnsavedChanges = true;
  activeFile.content = editor.value;
  updateLineNumbers(editor);
  scheduleProjectAutosave();
  if (autoRunCheckbox.checked) debouncedUpdatePreview();
  handleCodeChange({
    target: { id: activeFile.type + "Code", value: editor.value },
  });
}

function applyEditorMutation(editor, start, end, replacement, selectionStart, selectionEnd) {
  if (!editor) return;
  const rangeStart = typeof start === "number" ? start : editor.selectionStart;
  const rangeEnd = typeof end === "number" ? end : editor.selectionEnd;
  if (typeof editor.setRangeText === "function") {
    editor.setRangeText(replacement, rangeStart, rangeEnd, "preserve");
  } else {
    editor.value =
      editor.value.substring(0, rangeStart) +
      replacement +
      editor.value.substring(rangeEnd);
  }
  editor.selectionStart =
    typeof selectionStart === "number"
      ? selectionStart
      : rangeStart + replacement.length;
  editor.selectionEnd =
    typeof selectionEnd === "number" ? selectionEnd : editor.selectionStart;
  commitEditorMutation(editor);
}

// Sync scroll
function syncScroll(textarea) {
  if (!textarea) return;
  if (textarea.dataset.scrollSyncBound === "true") return;
  textarea.addEventListener("scroll", () => {
    lineNumbers.scrollTop = textarea.scrollTop;
    if (highlightLayer) {
      highlightLayer.scrollTop = textarea.scrollTop;
      highlightLayer.scrollLeft = textarea.scrollLeft;
    }
    renderErrorHighlights(textarea);
    renderRemoteCursors();
    if (suggestionPopup.style.display === "block") {
      positionSuggestionPopup(textarea);
    }
  });
  textarea.dataset.scrollSyncBound = "true";
}

function escapeHtml(text) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function wrapTokens(text, patterns) {
  const ranges = [];
  patterns.forEach((rule) => {
    const regex = new RegExp(rule.regex.source, rule.regex.flags);
    let match;
    while ((match = regex.exec(text)) !== null) {
      const start = match.index;
      const value = match[0];
      const end = start + value.length;
      if (end <= start) continue;
      if (ranges.some((r) => !(end <= r.start || start >= r.end))) continue;
      ranges.push({ start, end, className: rule.className });
      if (!regex.global) break;
    }
  });

  ranges.sort((a, b) => a.start - b.start);
  let result = "";
  let index = 0;
  ranges.forEach((r) => {
    if (index < r.start) result += escapeHtml(text.slice(index, r.start));
    result += `<span class="token ${r.className}">${escapeHtml(
      text.slice(r.start, r.end),
    )}</span>`;
    index = r.end;
  });
  if (index < text.length) result += escapeHtml(text.slice(index));
  return result || " ";
}

function highlightHtmlSegment(code) {
  const patterns = [
    { className: "comment", regex: /<!--[\s\S]*?-->/g },
    { className: "keyword", regex: /<!DOCTYPE[\s\S]*?>/gi },
    { className: "string", regex: /"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'/g },
    // Ensure full closing tags like </div> are colorized as tags.
    { className: "tag", regex: /<\/[a-zA-Z][a-zA-Z0-9-]*\s*>/g },
    {
      className: "attr",
      regex: /\b[a-zA-Z-:]+(?=\s*=\s*(?:"[^"]*"|'[^']*'))/g,
    },
    { className: "tag", regex: /<[a-zA-Z][a-zA-Z0-9-]*/g },
    { className: "tag", regex: /\/?>/g },
  ];
  return wrapTokens(code, patterns);
}

function highlightHtml(code) {
  const blockRegex =
    /(<style\b[^>]*>)([\s\S]*?)(<\/style>)|(<script\b(?![^>]*\bsrc=)[^>]*>)([\s\S]*?)(<\/script>)/gi;
  let result = "";
  let lastIndex = 0;
  let match;

  while ((match = blockRegex.exec(code)) !== null) {
    result += highlightHtmlSegment(code.slice(lastIndex, match.index));

    if (match[1]) {
      result += highlightHtmlSegment(match[1]);
      result += highlightCss(match[2] || "");
      result += highlightHtmlSegment(match[3]);
    } else {
      result += highlightHtmlSegment(match[4]);
      result += highlightJs(match[5] || "");
      result += highlightHtmlSegment(match[6]);
    }

    lastIndex = match.index + match[0].length;
  }

  result += highlightHtmlSegment(code.slice(lastIndex));
  return result;
}

function highlightCss(code) {
  const patterns = [
    { className: "comment", regex: /\/\*[\s\S]*?\*\//g },
    { className: "string", regex: /"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'/g },
    { className: "keyword", regex: /@[a-z-]+/gi },
    { className: "property", regex: /\b[a-z-]+(?=\s*:)/gi },
    { className: "number", regex: /\b\d+(\.\d+)?(px|rem|em|%|vh|vw|s|ms)?\b/g },
    { className: "selector", regex: /(^|})\s*[^@{}\n][^{\n]*(?=\{)/g },
    { className: "punctuation", regex: /[{}:;(),.]/g },
  ];
  return wrapTokens(code, patterns);
}

function highlightJs(code) {
  const patterns = [
    { className: "comment", regex: /\/\/[^\n]*|\/\*[\s\S]*?\*\//g },
    {
      className: "string",
      regex: /`(?:\\.|[^`\\])*`|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'/g,
    },
    {
      className: "keyword",
      regex:
        /\b(?:const|let|var|function|return|if|else|for|while|do|switch|case|break|continue|try|catch|finally|throw|new|class|extends|import|export|default|async|await|this|super|typeof|instanceof|in|of|null|undefined|true|false)\b/g,
    },
    { className: "number", regex: /\b\d+(\.\d+)?\b/g },
    { className: "operator", regex: /[=+\-*/%<>!&|^~?:]+/g },
    { className: "punctuation", regex: /[()[\]{};,.]/g },
  ];
  return wrapTokens(code, patterns);
}

function highlightPlainText(code) {
  return escapeHtml(code) || " ";
}

function renderSyntaxHighlight(textarea) {
  if (!highlightLayer || !textarea || !activeFile) return;
  const code = textarea.value || "";
  let highlighted = "";

  if (activeFile.type === "html") highlighted = highlightHtml(code);
  else if (activeFile.type === "css") highlighted = highlightCss(code);
  else if (activeFile.type === "js") highlighted = highlightJs(code);
  else highlighted = highlightPlainText(code);

  if (code.endsWith("\n")) highlighted += " ";
  highlightLayer.innerHTML = highlighted;
}

function syncSyntaxLayerStyle(textarea) {
  if (!highlightLayer || !textarea) return;
  const computed = window.getComputedStyle(textarea);
  highlightLayer.style.fontFamily = computed.fontFamily;
  highlightLayer.style.fontSize = computed.fontSize;
  highlightLayer.style.lineHeight = computed.lineHeight;
  highlightLayer.style.letterSpacing = computed.letterSpacing;
  highlightLayer.style.tabSize = computed.tabSize;
  highlightLayer.style.whiteSpace = computed.whiteSpace;
  highlightLayer.style.padding = computed.padding;
}

// PART 6 - EDITOR INITIALIZATION
function initializeEditor() {
  const editor = document.getElementById("activeEditor");
  editor.value = activeFile.content;
  updateLineNumbers(editor);
  syncScroll(editor);
  syncSyntaxLayerStyle(editor);
  renderSyntaxHighlight(editor);

  // MODIFIED: Combined input listener
  editor.addEventListener("input", (e) => {
    if (!canCurrentUserEditFile(activeFile ? activeFile.name : "")) {
      showNotification("You can only edit files selected by the host.", "error");
      editor.value = activeFile.content;
      return;
    }
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
  editor.addEventListener("click", () => {
    if (suggestionPopup.style.display === "block") {
      positionSuggestionPopup(editor);
    }
  });
  editor.addEventListener("blur", () => {
    setTimeout(() => {
      const active = document.activeElement;
      if (!active || !suggestionPopup.contains(active)) {
        hideSuggestions();
      }
    }, 0);
  });
}

// PART 6.5 - TAG SUGGESTIONS

/**
 * Handles the editor's 'input' event to show/hide suggestions.
 */
function handleSuggestions(e) {
  const editor = e.target;
  const pos = editor.selectionStart;
  const textBefore = editor.value.substring(0, pos);

  const isCssFile = activeFile.type === "css";
  const isHtmlStyleContext =
    activeFile.type === "html" && isInsideStyleTag(textBefore);
  const isJsFile = activeFile.type === "js";
  const isHtmlScriptContext =
    activeFile.type === "html" && isInsideScriptTag(textBefore);

  if (isCssFile || isHtmlStyleContext) {
    const cssContext = getCssSuggestionContext(textBefore);
    if (!cssContext) {
      hideSuggestions();
      return;
    }
    if (
      !String(cssContext.prefix || "").trim() &&
      !(cssContext.mode === "css-value" && isCssColorProperty(cssContext.propertyName))
    ) {
      hideSuggestions();
      return;
    }
    const cssSuggestions = getRankedCssSuggestions(
      cssContext.prefix,
      cssContext.mode,
      cssContext.propertyName,
    );
    if (
      cssContext.prefix &&
      cssSuggestions.some(
        (entry) =>
          entry.value.toLowerCase() === cssContext.prefix.toLowerCase(),
      )
    ) {
      hideSuggestions();
      return;
    }
    if (!cssSuggestions.length) {
      hideSuggestions();
      return;
    }
    currentSuggestionContext = cssContext;
    showCssSuggestions(editor, cssSuggestions, cssContext.mode);
    return;
  }

  if (isJsFile || isHtmlScriptContext) {
    const jsContext = getJsSuggestionContext(textBefore);
    if (!jsContext) {
      hideSuggestions();
      return;
    }
    const jsMatches = getRankedJsSuggestions(jsContext.prefix);
    if (!jsMatches.length) {
      hideSuggestions();
      return;
    }
    if (
      jsContext.prefix &&
      jsMatches.some(
        (entry) => entry.value.toLowerCase() === jsContext.prefix.toLowerCase(),
      )
    ) {
      hideSuggestions();
      return;
    }
    currentSuggestionContext = jsContext;
    showJsSuggestions(editor, jsMatches);
    return;
  }

  if (activeFile.type !== "html") {
    hideSuggestions();
    return;
  }

  const inlineStyleContext = getHtmlInlineStyleSuggestionContext(textBefore);
  if (inlineStyleContext) {
    if (
      !String(inlineStyleContext.prefix || "").trim() &&
      !(inlineStyleContext.mode === "css-inline-value" && isCssColorProperty(inlineStyleContext.propertyName))
    ) {
      hideSuggestions();
      return;
    }
    const cssSuggestions = getRankedCssSuggestions(
      inlineStyleContext.prefix,
      inlineStyleContext.mode,
      inlineStyleContext.propertyName,
    );
    if (!cssSuggestions.length) {
      hideSuggestions();
      return;
    }
    if (
      inlineStyleContext.prefix &&
      cssSuggestions.some(
        (entry) =>
          entry.value.toLowerCase() === inlineStyleContext.prefix.toLowerCase(),
      )
    ) {
      hideSuggestions();
      return;
    }
    currentSuggestionContext = inlineStyleContext;
    showCssSuggestions(editor, cssSuggestions, inlineStyleContext.mode);
    return;
  }

  const fileContext = getFileSuggestionContext(textBefore);

  if (fileContext) {
    const files = getRankedFileSuggestions(
      fileContext.valuePrefix,
      fileContext.attr,
      fileContext.tag,
    );
    if (!files.length) {
      hideSuggestions();
      return;
    }
    if (
      fileContext.valuePrefix &&
      files.some((name) => name.toLowerCase() === fileContext.valuePrefix.toLowerCase())
    ) {
      hideSuggestions();
      return;
    }
    showFileSuggestions(editor, files, fileContext.valuePrefix);
    return;
  }

  const attrContext = getHtmlAttributeSuggestionContext(textBefore);
  if (attrContext) {
    const attrSuggestions = getRankedHtmlAttributeSuggestions(
      attrContext.tag,
      attrContext.prefix,
      attrContext.usedAttributes,
    );
    if (!attrSuggestions.length) {
      hideSuggestions();
      return;
    }
    if (
      attrContext.prefix &&
      attrSuggestions.some(
        (entry) => entry.value.toLowerCase() === attrContext.prefix.toLowerCase(),
      )
    ) {
      hideSuggestions();
      return;
    }
    currentSuggestionContext = attrContext;
    showHtmlAttributeSuggestions(editor, attrSuggestions);
    return;
  }

  const closingMatch = textBefore.match(/<\/([a-zA-Z0-9-]*)$/);
  const openingMatch = textBefore.match(/<([a-zA-Z0-9-]*)$/);
  const currentLineText = textBefore.slice(textBefore.lastIndexOf("\n") + 1);
  const plainMatch = currentLineText.match(/([a-zA-Z][a-zA-Z0-9-]*)$/);
  const isClosing = Boolean(closingMatch);
  const isOpening = Boolean(openingMatch);
  const lastLt = textBefore.lastIndexOf("<");
  const lastGt = textBefore.lastIndexOf(">");
  const outsideTag = lastGt >= lastLt;
  const isPlain = !isClosing && !isOpening && outsideTag && Boolean(plainMatch);
  const prefix = isClosing
    ? closingMatch[1]
    : isOpening
      ? openingMatch[1]
      : isPlain
        ? plainMatch[1]
        : "";

  if (!isClosing && !isOpening && !isPlain) {
    hideSuggestions();
    return;
  }

  const suggestions = getRankedTagSuggestions(prefix);
  if (!suggestions.length) {
    hideSuggestions();
    return;
  }
  if (
    prefix &&
    !isPlain &&
    suggestions.some((entry) => entry.tag.toLowerCase() === prefix.toLowerCase())
  ) {
    hideSuggestions();
    return;
  }

  const mode = isClosing
    ? "tag-closing"
    : isOpening
      ? "tag-opening"
      : "tag-plain";
  currentSuggestionContext = null;
  showSuggestions(editor, suggestions, prefix, mode);
}

/**
 * Hides tag suggestion popup and resets active item.
 */
function hideSuggestions() {
  suggestionPopup.style.display = "none";
  suggestionPopup.innerHTML = "";
  suggestionPopup.dataset.mode = "";
  currentSuggestionContext = null;
  activeSuggestion = -1;
}

function getRankedTagSuggestions(prefix) {
  const q = (prefix || "").toLowerCase();
  const matches = tagSuggestionPool.filter((entry) => entry.tag.includes(q));
  matches.sort((a, b) => {
    const aTag = a.tag.toLowerCase();
    const bTag = b.tag.toLowerCase();
    const aStarts = aTag.startsWith(q) ? 1 : 0;
    const bStarts = bTag.startsWith(q) ? 1 : 0;
    if (aStarts !== bStarts) return bStarts - aStarts;
    if (aTag.length !== bTag.length) return aTag.length - bTag.length;
    return aTag.localeCompare(bTag);
  });
  return matches.slice(0, 40);
}

function isInsideStyleTag(textBefore) {
  const opens = (textBefore.match(/<style\b[^>]*>/gi) || []).length;
  const closes = (textBefore.match(/<\/style>/gi) || []).length;
  return opens > closes;
}

function isInsideScriptTag(textBefore) {
  const opens = (textBefore.match(/<script\b[^>]*>/gi) || []).length;
  const closes = (textBefore.match(/<\/script>/gi) || []).length;
  return opens > closes;
}

function stripQuotedContent(text) {
  return String(text || "").replace(
    /"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|`(?:\\.|[^`\\])*`/g,
    (match) => " ".repeat(match.length),
  );
}

function getCssSuggestionContext(textBefore) {
  const sanitizedText = stripQuotedContent(textBefore);
  const lineStart = textBefore.lastIndexOf("\n") + 1;
  const lineText = textBefore.substring(lineStart);
  const sanitizedLineText = sanitizedText.substring(lineStart);
  if (/^\s*\/\//.test(lineText) || /\/\*[^*]*$/.test(sanitizedText)) return null;
  const valueMatch = sanitizedLineText.match(/([a-z-]+)\s*:\s*([^;}]*)$/i);
  if (valueMatch) {
    const propertyName = valueMatch[1].toLowerCase();
    const rawValue = lineText.slice(valueMatch.index + valueMatch[0].indexOf(valueMatch[2]));
    const trimLeftCount = rawValue.length - rawValue.replace(/^\s+/, "").length;
    const valuePrefix = rawValue.substring(trimLeftCount);
    const replaceEnd = textBefore.length;
    const replaceStart = replaceEnd - valuePrefix.length;
    return {
      mode: "css-value",
      propertyName,
      prefix: valuePrefix,
      replaceStart,
      replaceEnd,
    };
  }

  const cssWithoutStrings = sanitizedText;
  const openBraces = (cssWithoutStrings.match(/\{/g) || []).length;
  const closeBraces = (cssWithoutStrings.match(/\}/g) || []).length;
  const insideDeclaration = openBraces > closeBraces;

  if (insideDeclaration) {
    const propMatch = sanitizedLineText.match(/([a-z-]*)$/i);
    const propertyPrefix = propMatch ? propMatch[1] : "";
    return {
      mode: "css-property",
      propertyName: "",
      prefix: propertyPrefix,
      replaceStart: textBefore.length - propertyPrefix.length,
      replaceEnd: textBefore.length,
    };
  }

  const selectorMatch = sanitizedLineText.match(/([@.#a-z0-9_-]*)$/i);
  const selectorPrefix = selectorMatch ? selectorMatch[1] : "";
  return {
    mode: "css-selector",
    propertyName: "",
    prefix: selectorPrefix,
    replaceStart: textBefore.length - selectorPrefix.length,
    replaceEnd: textBefore.length,
  };
}

function getJsSuggestionContext(textBefore) {
  const sanitizedText = stripQuotedContent(textBefore);
  const lineStart = textBefore.lastIndexOf("\n") + 1;
  const lineText = textBefore.substring(lineStart);
  const sanitizedLineText = sanitizedText.substring(lineStart);

  if (/^\s*\/\//.test(lineText) || /\/\*[^*]*$/.test(sanitizedText)) return null;

  const tokenMatch = sanitizedLineText.match(/([A-Za-z_$][\w$.]*)$/);
  if (!tokenMatch) return null;

  const prefix = tokenMatch[1];
  return {
    mode: "js",
    prefix,
    replaceStart: textBefore.length - prefix.length,
    replaceEnd: textBefore.length,
  };
}

function getHtmlInlineStyleSuggestionContext(textBefore) {
  const match = textBefore.match(
    /<([a-zA-Z][a-zA-Z0-9-]*)[^<>]*\bstyle=(["'])([^"']*)$/i,
  );
  if (!match) return null;

  const styleValue = match[3] || "";
  const sanitizedStyleValue = stripQuotedContent(styleValue);
  if (/\/\*[^*]*$/.test(sanitizedStyleValue)) return null;

  const declarationStart = sanitizedStyleValue.lastIndexOf(";") + 1;
  const declarationText = styleValue.slice(declarationStart);
  const sanitizedDeclarationText = sanitizedStyleValue.slice(declarationStart);

  const valueMatch = sanitizedDeclarationText.match(/([a-z-]+)\s*:\s*([^;]*)$/i);
  if (valueMatch) {
    const propertyName = valueMatch[1].toLowerCase();
    const rawValue = declarationText.slice(
      valueMatch.index + valueMatch[0].indexOf(valueMatch[2]),
    );
    const trimLeftCount = rawValue.length - rawValue.replace(/^\s+/, "").length;
    const valuePrefix = rawValue.substring(trimLeftCount);
    const replaceEnd = textBefore.length;
    const replaceStart = replaceEnd - valuePrefix.length;
    return {
      mode: "css-inline-value",
      propertyName,
      prefix: valuePrefix,
      replaceStart,
      replaceEnd,
    };
  }

  const propMatch = sanitizedDeclarationText.match(/([a-z-]*)$/i);
  const propertyPrefix = propMatch ? propMatch[1] : "";
  return {
    mode: "css-inline-property",
    propertyName: "",
    prefix: propertyPrefix,
    replaceStart: textBefore.length - propertyPrefix.length,
    replaceEnd: textBefore.length,
  };
}

function isCssColorProperty(propertyName) {
  return [
    "color",
    "background-color",
    "border-color",
    "outline-color",
    "text-decoration-color",
    "caret-color",
    "accent-color",
    "column-rule-color",
    "background",
  ].includes(String(propertyName || "").toLowerCase());
}

function getCssColorSwatch(value, propertyName) {
  const prop = String(propertyName || "").toLowerCase();
  const rawValue = String(value || "").trim();
  if (!rawValue) return "";
  const isColorProperty =
    prop === "color" ||
    prop === "background-color" ||
    prop === "border-color" ||
    prop === "outline-color" ||
    prop === "text-decoration-color" ||
    prop === "caret-color" ||
    prop === "accent-color" ||
    prop === "column-rule-color" ||
    prop === "background";
  if (!isColorProperty) return "";
  if (/^(inherit|initial|unset|currentcolor)$/i.test(rawValue)) return "";
  if (/^url\(/i.test(rawValue)) return "";
  if (
    !/^(#|rgb\(|rgba\(|hsl\(|hsla\(|transparent$|black$|white$|red$|blue$|green$|yellow$|orange$|purple$|pink$|brown$|gray$|grey$|teal$|navy$|lime$|olive$|maroon$|aqua$|fuchsia$|silver$)/i.test(rawValue)
  ) {
    return "";
  }
  if (/^transparent$/i.test(rawValue)) {
    return "linear-gradient(45deg, #d1d5db 25%, transparent 25%, transparent 50%, #d1d5db 50%, #d1d5db 75%, transparent 75%, transparent), #ffffff";
  }
  return rawValue;
}

function getRankedCssSuggestions(prefix, mode, propertyName) {
  const q = (prefix || "").toLowerCase();
  let source = [];
  if (mode === "css-property" || mode === "css-inline-property") {
    source = cssPropertySuggestions.map((value) => ({
      value,
      desc: "CSS property",
    }));
  } else if (mode === "css-value" || mode === "css-inline-value") {
    const propertyValues = cssValueSuggestionsByProperty[propertyName] || [];
    source = [...propertyValues, ...cssGenericValueSuggestions].map((value) => ({
      value,
      desc: `Value for ${propertyName || "property"}`,
      swatch: getCssColorSwatch(value, propertyName),
    }));
    const trimmedPrefix = String(prefix || "").trim();
    if (/^-?\d*\.?\d+$/.test(trimmedPrefix)) {
      source.unshift({
        value: `${trimmedPrefix}px`,
        desc: "Pixel value",
        swatch: "",
      });
    }
  } else {
    source = cssSelectorSuggestions.map((value) => ({
      value,
      desc: "Selector or at-rule",
    }));
  }

  const deduped = Array.from(
    new Map(source.map((entry) => [entry.value.toLowerCase(), entry])).values(),
  );
  const matches = deduped.filter((entry) =>
    entry.value.toLowerCase().includes(q),
  );
  matches.sort((a, b) => {
    const aValue = a.value.toLowerCase();
    const bValue = b.value.toLowerCase();
    const aStarts = aValue.startsWith(q) ? 1 : 0;
    const bStarts = bValue.startsWith(q) ? 1 : 0;
    if (aStarts !== bStarts) return bStarts - aStarts;
    if (aValue.length !== bValue.length) return aValue.length - bValue.length;
    return aValue.localeCompare(bValue);
  });
  return matches.slice(0, 30);
}

function getRankedJsSuggestions(prefix) {
  const q = (prefix || "").toLowerCase();
  const matches = jsSuggestions.filter((entry) =>
    entry.value.toLowerCase().includes(q),
  );
  matches.sort((a, b) => {
    const aValue = a.value.toLowerCase();
    const bValue = b.value.toLowerCase();
    const aStarts = aValue.startsWith(q) ? 1 : 0;
    const bStarts = bValue.startsWith(q) ? 1 : 0;
    if (aStarts !== bStarts) return bStarts - aStarts;
    if (aValue.length !== bValue.length) return aValue.length - bValue.length;
    return aValue.localeCompare(bValue);
  });
  return matches.slice(0, 20);
}

function getFileSuggestionContext(textBefore) {
  const match = textBefore.match(
    /<([a-zA-Z0-9-]+)[^<>]*\b(href|src)=["']([^"']*)$/i,
  );
  if (!match) return null;
  return {
    tag: match[1].toLowerCase(),
    attr: match[2].toLowerCase(),
    valuePrefix: match[3],
  };
}

function getHtmlAttributeSuggestionContext(textBefore) {
  const lastLt = textBefore.lastIndexOf("<");
  const lastGt = textBefore.lastIndexOf(">");
  if (lastLt === -1 || lastGt > lastLt) return null;

  const openTagText = textBefore.slice(lastLt);
  if (/^<\//.test(openTagText) || /\/\s*$/.test(openTagText)) return null;
  if (/=\s*["'][^"']*$/.test(openTagText)) return null;

  const tagMatch = openTagText.match(/^<([a-zA-Z][a-zA-Z0-9-]*)\b/i);
  if (!tagMatch) return null;

  const tag = tagMatch[1].toLowerCase();
  const afterTagName = openTagText.slice(tagMatch[0].length);
  const usedAttributes = Array.from(
    afterTagName.matchAll(/\b([a-zA-Z_:][-a-zA-Z0-9_:.]*)\b(?=\s*(?:=|\s|$))/g),
  ).map((match) => match[1].toLowerCase());

  const attrMatch = openTagText.match(/(?:\s|<)([a-zA-Z_:][-a-zA-Z0-9_:.]*)?$/);
  if (!attrMatch) return null;

  const prefix = attrMatch[1] || "";
  const replaceEnd = textBefore.length;
  const replaceStart = replaceEnd - prefix.length;

  if (!prefix && !/\s$/.test(openTagText)) return null;

  return {
    mode: "html-attr",
    tag,
    prefix,
    replaceStart,
    replaceEnd,
    usedAttributes,
  };
}

function getRankedHtmlAttributeSuggestions(tagName, prefix, usedAttributes) {
  const meta = htmlTagMetaMap.get(tagName) || { attrs: [] };
  const used = new Set((usedAttributes || []).map((value) => value.toLowerCase()));
  const source = [...globalHtmlAttributes, ...(meta.attrs || [])];
  const unique = Array.from(new Set(source));
  const q = (prefix || "").toLowerCase();
  const matches = unique
    .filter((attr) => {
      const normalized = attr.toLowerCase();
      if (used.has(normalized) && normalized !== "data-*") return false;
      return !q || normalized.includes(q);
    })
    .map((attr) => ({
      value: attr,
      desc: htmlAttributeDescriptions[attr] || `Attribute for <${tagName}>`,
    }));

  matches.sort((a, b) => {
    const aValue = a.value.toLowerCase();
    const bValue = b.value.toLowerCase();
    const aStarts = q && aValue.startsWith(q) ? 1 : 0;
    const bStarts = q && bValue.startsWith(q) ? 1 : 0;
    if (aStarts !== bStarts) return bStarts - aStarts;
    if (aValue.length !== bValue.length) return aValue.length - bValue.length;
    return aValue.localeCompare(bValue);
  });

  return matches.slice(0, 20);
}

function getFileType(name) {
  const parts = name.split(".");
  return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : "";
}

function matchesExtensionByContext(fileName, attr, tag) {
  const ext = getFileType(fileName);
  const imageExt = new Set(["png", "jpg", "jpeg", "gif", "svg", "webp", "ico"]);
  const mediaExt = new Set(["mp3", "wav", "ogg", "mp4", "webm", "m4a"]);

  if (attr === "href" && tag === "link") return ext === "css" || imageExt.has(ext);
  if (attr === "href" && tag === "a") return true;
  if (attr === "src" && tag === "script") return ext === "js" || ext === "mjs";
  if (attr === "src" && tag === "img") return imageExt.has(ext);
  if (attr === "src" && (tag === "audio" || tag === "video" || tag === "source")) {
    return mediaExt.has(ext);
  }
  return true;
}

function getRankedFileSuggestions(prefix, attr, tag) {
  const q = (prefix || "").toLowerCase().replace(/^\.?\//, "");
  const candidates = projectFiles
    .map((f) => f.name)
    .filter((name) => matchesExtensionByContext(name, attr, tag));

  const matches = candidates.filter((name) =>
    name.toLowerCase().replace(/^\.?\//, "").includes(q),
  );
  matches.sort((a, b) => {
    const aa = a.toLowerCase().replace(/^\.?\//, "");
    const bb = b.toLowerCase().replace(/^\.?\//, "");
    const aStarts = aa.startsWith(q) ? 1 : 0;
    const bStarts = bb.startsWith(q) ? 1 : 0;
    if (aStarts !== bStarts) return bStarts - aStarts;
    if (a.length !== b.length) return a.length - b.length;
    return a.localeCompare(b);
  });
  return matches.slice(0, 30);
}

function getFileIcon(fileName) {
  const ext = getFileType(fileName);
  if (ext === "html") return "HTML";
  if (ext === "css") return "CSS";
  if (ext === "js" || ext === "mjs") return "JS";
  if (["png", "jpg", "jpeg", "gif", "svg", "webp", "ico"].includes(ext)) return "IMG";
  if (["mp3", "wav", "ogg", "mp4", "webm", "m4a"].includes(ext)) return "MED";
  return "FILE";
}

function getCaretCoordinates(textarea, pos) {
  const div = document.createElement("div");
  const style = window.getComputedStyle(textarea);
  const copyProps = [
    "boxSizing",
    "width",
    "height",
    "overflowX",
    "overflowY",
    "borderTopWidth",
    "borderRightWidth",
    "borderBottomWidth",
    "borderLeftWidth",
    "paddingTop",
    "paddingRight",
    "paddingBottom",
    "paddingLeft",
    "fontStyle",
    "fontVariant",
    "fontWeight",
    "fontStretch",
    "fontSize",
    "fontFamily",
    "lineHeight",
    "letterSpacing",
    "textAlign",
    "textTransform",
    "textIndent",
    "textDecoration",
    "tabSize",
    "whiteSpace",
    "wordSpacing",
    "direction",
  ];
  copyProps.forEach((prop) => {
    div.style[prop] = style[prop];
  });

  div.style.position = "absolute";
  div.style.visibility = "hidden";
  div.style.pointerEvents = "none";
  div.style.whiteSpace = "pre";
  div.style.overflow = "hidden";

  const value = textarea.value;
  const before = value.substring(0, pos);
  const after = value.substring(pos) || " ";
  div.textContent = before;
  const marker = document.createElement("span");
  marker.textContent = after[0];
  div.appendChild(marker);

  document.body.appendChild(div);
  const coords = {
    top: marker.offsetTop - textarea.scrollTop,
    left: marker.offsetLeft - textarea.scrollLeft,
    lineHeight: parseFloat(style.lineHeight) || 20,
  };
  document.body.removeChild(div);
  return coords;
}

function positionSuggestionPopup(editor) {
  if (suggestionPopup.style.display !== "block") return;
  const coords = getCaretCoordinates(editor, editor.selectionStart);
  const wrapperRect = editor.parentElement.getBoundingClientRect();
  const popupRect = suggestionPopup.getBoundingClientRect();

  const margin = 10;
  let left = coords.left + margin;
  let top = coords.top + coords.lineHeight + 6;

  const maxLeft = wrapperRect.width - popupRect.width - margin;
  const maxTop = wrapperRect.height - popupRect.height - margin;
  left = Math.max(margin, Math.min(left, Math.max(margin, maxLeft)));
  top = Math.max(margin, Math.min(top, Math.max(margin, maxTop)));

  suggestionPopup.style.left = `${left}px`;
  suggestionPopup.style.top = `${top}px`;
}

/**
 * Displays the suggestion popup with filtered tags.
 */
function showSuggestions(editor, suggestions, prefix, mode) {
  suggestionPopup.innerHTML = "";
  suggestionPopup.dataset.mode = mode;
  currentSuggestionContext = null;

  const header = document.createElement("div");
  header.className = "suggestion-header";
  header.innerHTML = `
    <span>HTML tags (${suggestions.length})</span>
    <span class="suggestion-shortcuts">
      <span class="suggestion-shortcut">Enter</span>
      <span class="suggestion-shortcut">Tab</span>
      <span class="suggestion-shortcut">Esc</span>
    </span>
  `;
  suggestionPopup.appendChild(header);

  suggestions.forEach((tagMeta) => {
    const suggestionItem = document.createElement("div");
    suggestionItem.className = "suggestion-item";
    const tagText = tagMeta.tag;
    const lcTag = tagText.toLowerCase();
    const lcPrefix = prefix.toLowerCase();
    const idx = lcPrefix ? lcTag.indexOf(lcPrefix) : -1;
    const highlightedTag =
      idx > -1
        ? `${escapeHtml(tagText.slice(0, idx))}<span class="highlight">${escapeHtml(
            tagText.slice(idx, idx + prefix.length),
          )}</span>${escapeHtml(tagText.slice(idx + prefix.length))}`
        : escapeHtml(tagText);

    const attrs =
      tagMeta.attrs && tagMeta.attrs.length
        ? tagMeta.attrs.slice(0, 3).join(", ")
        : "";
    const badge = tagMeta.badge
      ? `<span class="suggestion-badge">${escapeHtml(tagMeta.badge)}</span>`
      : "";
    const safeIcon = mode === "tag-closing" ? "</>" : "<>";
    suggestionItem.innerHTML = `
      <span class="suggestion-icon">${escapeHtml(safeIcon)}</span>
      <span class="suggestion-content">
        <div class="suggestion-tag">&lt;${highlightedTag}&gt;${badge}</div>
        <div class="suggestion-desc">${escapeHtml(tagMeta.desc || "HTML element")}${attrs ? ` - ${escapeHtml(attrs)}` : ""}</div>
      </span>
    `;
    suggestionItem.dataset.tag = tagText;
    // Use mousedown instead of click to fire before blur
    suggestionItem.addEventListener("mousedown", (e) => {
      e.preventDefault();
      selectSuggestion(tagText);
    });
    suggestionPopup.appendChild(suggestionItem);
  });

  suggestionPopup.style.display = "block";
  activeSuggestion = 0;
  const items = suggestionPopup.querySelectorAll(".suggestion-item");
  updateSuggestionHighlight(items);
  positionSuggestionPopup(editor);
}

function showCssSuggestions(editor, suggestions, mode) {
  suggestionPopup.innerHTML = "";
  suggestionPopup.dataset.mode = mode;

  const header = document.createElement("div");
  header.className = "suggestion-header";
  const title =
    mode === "css-property"
      ? "CSS properties"
      : mode === "css-value"
        ? "CSS values"
        : "CSS selectors";
  header.innerHTML = `
    <span>${title} (${suggestions.length})</span>
    <span class="suggestion-shortcuts">
      <span class="suggestion-shortcut">Enter</span>
      <span class="suggestion-shortcut">Tab</span>
      <span class="suggestion-shortcut">Esc</span>
    </span>
  `;
  suggestionPopup.appendChild(header);

  suggestions.forEach((entry) => {
    const suggestionItem = document.createElement("div");
    suggestionItem.className = "suggestion-item";
    const preview = entry.swatch
      ? `<span class="suggestion-color-preview" style="background:${escapeHtml(entry.swatch)}"></span>`
      : "";
    suggestionItem.innerHTML = `
      <span class="suggestion-icon">${preview || "CSS"}</span>
      <span class="suggestion-content">
        <div class="suggestion-tag">${escapeHtml(entry.value)}</div>
        <div class="suggestion-desc">${escapeHtml(entry.desc || "CSS suggestion")}</div>
      </span>
    `;
    suggestionItem.dataset.tag = entry.value;
    suggestionItem.addEventListener("mousedown", (e) => {
      e.preventDefault();
      selectSuggestion(entry.value);
    });
    suggestionPopup.appendChild(suggestionItem);
  });

  suggestionPopup.style.display = "block";
  activeSuggestion = 0;
  const items = suggestionPopup.querySelectorAll(".suggestion-item");
  updateSuggestionHighlight(items);
  positionSuggestionPopup(editor);
}

function showHtmlAttributeSuggestions(editor, suggestions) {
  suggestionPopup.innerHTML = "";
  suggestionPopup.dataset.mode = "html-attr";

  const header = document.createElement("div");
  header.className = "suggestion-header";
  header.innerHTML = `
    <span>HTML attributes (${suggestions.length})</span>
    <span class="suggestion-shortcuts">
      <span class="suggestion-shortcut">Enter</span>
      <span class="suggestion-shortcut">Tab</span>
      <span class="suggestion-shortcut">Esc</span>
    </span>
  `;
  suggestionPopup.appendChild(header);

  suggestions.forEach((entry) => {
    const suggestionItem = document.createElement("div");
    suggestionItem.className = "suggestion-item";
    suggestionItem.innerHTML = `
      <span class="suggestion-icon">ATTR</span>
      <span class="suggestion-content">
        <div class="suggestion-tag">${escapeHtml(entry.value)}</div>
        <div class="suggestion-desc">${escapeHtml(entry.desc || "HTML attribute")}</div>
      </span>
    `;
    suggestionItem.dataset.tag = entry.value;
    suggestionItem.addEventListener("mousedown", (e) => {
      e.preventDefault();
      selectSuggestion(entry.value);
    });
    suggestionPopup.appendChild(suggestionItem);
  });

  suggestionPopup.style.display = "block";
  activeSuggestion = 0;
  const items = suggestionPopup.querySelectorAll(".suggestion-item");
  updateSuggestionHighlight(items);
  positionSuggestionPopup(editor);
}

function showJsSuggestions(editor, suggestions) {
  suggestionPopup.innerHTML = "";
  suggestionPopup.dataset.mode = "js";

  const header = document.createElement("div");
  header.className = "suggestion-header";
  header.innerHTML = `
    <span>JavaScript (${suggestions.length})</span>
    <span class="suggestion-shortcuts">
      <span class="suggestion-shortcut">Enter</span>
      <span class="suggestion-shortcut">Tab</span>
      <span class="suggestion-shortcut">Esc</span>
    </span>
  `;
  suggestionPopup.appendChild(header);

  suggestions.forEach((entry) => {
    const suggestionItem = document.createElement("div");
    suggestionItem.className = "suggestion-item";
    suggestionItem.innerHTML = `
      <span class="suggestion-icon">JS</span>
      <span class="suggestion-content">
        <div class="suggestion-tag">${escapeHtml(entry.value)}</div>
        <div class="suggestion-desc">${escapeHtml(entry.desc || "JavaScript suggestion")}</div>
      </span>
    `;
    suggestionItem.dataset.tag = entry.value;
    suggestionItem.addEventListener("mousedown", (e) => {
      e.preventDefault();
      selectSuggestion(entry.value);
    });
    suggestionPopup.appendChild(suggestionItem);
  });

  suggestionPopup.style.display = "block";
  activeSuggestion = 0;
  const items = suggestionPopup.querySelectorAll(".suggestion-item");
  updateSuggestionHighlight(items);
  positionSuggestionPopup(editor);
}

function showFileSuggestions(editor, fileSuggestions, prefix) {
  suggestionPopup.innerHTML = "";
  suggestionPopup.dataset.mode = "file";
  currentSuggestionContext = null;

  const header = document.createElement("div");
  header.className = "suggestion-header";
  header.innerHTML = `
    <span>Project files (${fileSuggestions.length})</span>
    <span class="suggestion-shortcuts">
      <span class="suggestion-shortcut">Enter</span>
      <span class="suggestion-shortcut">Tab</span>
      <span class="suggestion-shortcut">Esc</span>
    </span>
  `;
  suggestionPopup.appendChild(header);

  const q = (prefix || "").toLowerCase().replace(/^\.?\//, "");
  fileSuggestions.forEach((fileName) => {
    const suggestionItem = document.createElement("div");
    suggestionItem.className = "suggestion-item";

    const normalized = fileName.toLowerCase().replace(/^\.?\//, "");
    const idx = q ? normalized.indexOf(q) : -1;
    const highlightedName =
      idx > -1
        ? `${escapeHtml(fileName.slice(0, idx))}<span class="highlight">${escapeHtml(
            fileName.slice(idx, idx + q.length),
          )}</span>${escapeHtml(fileName.slice(idx + q.length))}`
        : escapeHtml(fileName);

    suggestionItem.innerHTML = `
      <span class="suggestion-icon">${escapeHtml(getFileIcon(fileName))}</span>
      <span class="suggestion-content">
        <div class="suggestion-tag">${highlightedName}</div>
        <div class="suggestion-desc">Use file path in current attribute</div>
      </span>
    `;
    suggestionItem.dataset.tag = fileName;
    suggestionItem.addEventListener("mousedown", (ev) => {
      ev.preventDefault();
      selectSuggestion(fileName);
    });
    suggestionPopup.appendChild(suggestionItem);
  });

  suggestionPopup.style.display = "block";
  activeSuggestion = 0;
  const items = suggestionPopup.querySelectorAll(".suggestion-item");
  updateSuggestionHighlight(items);
  positionSuggestionPopup(editor);
}

/**
 * Inserts the selected suggestion into the editor.
 */
function selectSuggestion(tag) {
  const mode = suggestionPopup.dataset.mode;
  if (mode === "file") {
    selectFileSuggestion(tag);
    return;
  }
  if (
    mode === "css-property" ||
    mode === "css-value" ||
    mode === "css-selector" ||
    mode === "css-inline-property" ||
    mode === "css-inline-value"
  ) {
    selectCssSuggestion(tag);
    return;
  }
  if (mode === "js") {
    selectJsSuggestion(tag);
    return;
  }
  if (mode === "html-attr") {
    selectHtmlAttributeSuggestion(tag);
    return;
  }

  const editor = document.getElementById("activeEditor");
  const pos = editor.selectionStart;
  const textBefore = editor.value.substring(0, pos);
  const isClosing = mode === "tag-closing";
  const isPlain = mode === "tag-plain";
  const triggerMatch = isClosing
    ? textBefore.match(/<\/([a-zA-Z0-9-]*)$/)
    : isPlain
      ? textBefore.match(/(?:^|[\s>])([a-zA-Z][a-zA-Z0-9-]*)$/)
      : textBefore.match(/<([a-zA-Z0-9-]*)$/);

  if (!triggerMatch) return;

  const prefix = triggerMatch[1];
  const textBeforeTrigger = textBefore.substring(
    0,
    textBefore.length - prefix.length,
  );
  const textAfter = editor.value.substring(editor.selectionEnd);
  const suggestionMeta = htmlTagMetaMap.get(tag);

  if (suggestionMeta && suggestionMeta.insertText) {
    const replaceStart = textBefore.length - prefix.length;
    const insertedText = suggestionMeta.insertText;
    const caretPos = replaceStart + insertedText.length;
    applyEditorMutation(
      editor,
      replaceStart,
      editor.selectionEnd,
      insertedText,
      caretPos,
      caretPos,
    );
    hideSuggestions();
    editor.focus();
    return;
  }

  const insertedTag = isPlain ? `<${tag}>` : `${tag}>`;
  const shouldAutoClose = !isClosing && !selfClosingTags.includes(tag);
  const closingTag = shouldAutoClose ? `</${tag}>` : "";
  const replaceStart = textBefore.length - prefix.length;
  const insertedText = insertedTag + closingTag;
  const caretPos = textBeforeTrigger.length + insertedTag.length;
  applyEditorMutation(
    editor,
    replaceStart,
    editor.selectionEnd,
    insertedText,
    caretPos,
    caretPos,
  );

  hideSuggestions();
  editor.focus();
}

function selectJsSuggestion(value) {
  const editor = document.getElementById("activeEditor");
  if (!currentSuggestionContext) return;

  const { replaceStart, replaceEnd } = currentSuggestionContext;
  const entry = jsSuggestions.find((item) => item.value === value);
  const insertText = entry ? entry.insertText || entry.value : value;
  let cursorOffset = insertText.length;
  const quotePos = insertText.indexOf("\"\"");
  if (quotePos > -1) {
    cursorOffset = quotePos + 1;
  } else {
    const parenPos = insertText.indexOf("()");
    if (parenPos > -1) {
      cursorOffset = parenPos + 1;
    } else {
      const braceLine = insertText.indexOf("\n" + INDENT_UNIT);
      if (braceLine > -1) {
        cursorOffset = braceLine + 1 + INDENT_UNIT.length;
      }
    }
  }

  const caretPos = replaceStart + cursorOffset;
  applyEditorMutation(
    editor,
    replaceStart,
    replaceEnd,
    insertText,
    caretPos,
    caretPos,
  );
  hideSuggestions();
  editor.focus();
}

function selectHtmlAttributeSuggestion(attrName) {
  const editor = document.getElementById("activeEditor");
  if (!currentSuggestionContext) return;

  const { replaceStart, replaceEnd } = currentSuggestionContext;
  const lowerAttr = attrName.toLowerCase();
  const booleanAttrs = new Set([
    "controls",
    "autoplay",
    "loop",
    "muted",
    "required",
    "disabled",
    "checked",
    "selected",
    "hidden",
    "readonly",
    "multiple",
  ]);

  const needsQuotedValue =
    !booleanAttrs.has(lowerAttr) && lowerAttr !== "data-*";
  const insertedText = needsQuotedValue
    ? `${attrName}=""`
    : attrName === "data-*"
      ? 'data-=""'
      : attrName;

  const cursorOffset =
    attrName === "data-*"
      ? 5
      : lowerAttr === "style"
        ? insertedText.indexOf('""') + 1
        : needsQuotedValue
          ? insertedText.length - 1
          : insertedText.length;
  const caretPos = replaceStart + cursorOffset;
  applyEditorMutation(
    editor,
    replaceStart,
    replaceEnd,
    insertedText,
    caretPos,
    caretPos,
  );
  hideSuggestions();
  editor.focus();
}

function selectCssSuggestion(value) {
  const editor = document.getElementById("activeEditor");
  if (!currentSuggestionContext) return;

  const { mode, replaceStart, replaceEnd } = currentSuggestionContext;
  let insertedText = value;
  let cursorOffset = value.length;

  if (mode === "css-property") {
    const afterSlice = editor.value.substring(replaceEnd);
    if (!/^\s*:/.test(afterSlice)) {
      insertedText = `${value}: ;`;
      cursorOffset = value.length + 2;
    }
  } else if (mode === "css-inline-property") {
    const afterSlice = editor.value.substring(replaceEnd);
    if (/^\s*:/.test(afterSlice)) {
      insertedText = value;
      cursorOffset = insertedText.length;
    } else {
      insertedText = `${value}: ;`;
      cursorOffset = value.length + 2;
    }
  } else if (mode === "css-inline-value") {
    const afterSlice = editor.value.substring(replaceEnd);
    if (/^\s*;/.test(afterSlice)) {
      insertedText = value;
      cursorOffset = insertedText.length;
    } else {
      insertedText = `${value}; `;
      cursorOffset = insertedText.length;
    }
  } else if (mode === "css-selector") {
    const afterSlice = editor.value.substring(replaceEnd);
    if (!/^\s*\{/.test(afterSlice)) {
      insertedText = `${value} {\n${INDENT_UNIT}\n}`;
      cursorOffset = value.length + 3 + INDENT_UNIT.length;
    }
  }

  const caretPos = replaceStart + cursorOffset;
  applyEditorMutation(
    editor,
    replaceStart,
    replaceEnd,
    insertedText,
    caretPos,
    caretPos,
  );
  hideSuggestions();
  editor.focus();
}

function selectFileSuggestion(filePath) {
  const editor = document.getElementById("activeEditor");
  const pos = editor.selectionStart;
  const textBefore = editor.value.substring(0, pos);
  const match = textBefore.match(
    /(<[a-zA-Z0-9-]+[^<>]*\b(?:href|src)=["'])([^"']*)$/i,
  );
  if (!match) return;

  const typedPrefix = match[2];
  const replaceStart = pos - typedPrefix.length;
  let finalPath = filePath;
  if (/^\.\//.test(typedPrefix) && !finalPath.startsWith("./")) {
    finalPath = `./${finalPath}`;
  }

  const caretPos = replaceStart + finalPath.length;
  applyEditorMutation(
    editor,
    replaceStart,
    editor.selectionEnd,
    finalPath,
    caretPos,
    caretPos,
  );
  hideSuggestions();
  editor.focus();
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

// PART 6.7 - AUTO-CLOSING & INDENTATION LOGIC

/**
 * Handles auto-closing of brackets/parentheses and indentation on 'Enter'.
 * This is specific for CSS and JS files.
 */
function handleAutoCloseAndIndent(e, editor) {
  const fileType = activeFile.type;
  const pos = editor.selectionStart;
  const textBefore = editor.value.substring(0, pos);
  const textAfter = editor.value.substring(pos);
  const isCssContext = fileType === "css" || (fileType === "html" && isInsideStyleTag(textBefore));
  const isJsContext = fileType === "js" || (fileType === "html" && isInsideScriptTag(textBefore));

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

  if (isCssContext || isJsContext) {
    // Check for { (CSS blocks or JS objects/functions)
    if (e.key === "{") {
      autoClosePair = "{";
      closingChar = "}";
    }
    // Check for ( (JS function calls or definitions)
    else if (isJsContext && e.key === "(") {
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
    applyEditorMutation(editor, pos, editor.selectionEnd, autoClosePair + closingChar, pos + 1, pos + 1);

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
      const nextIndent = currentIndent + INDENT_UNIT;

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
          // Insert: newline + indent + newline + closing bracket
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
        // Insert: newline + indent + newline
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
    applyEditorMutation(
      editor,
      0,
      editor.value.length,
      newContent,
      newCursorPos,
      newCursorPos,
    );

    return true; // Handled
  }

  return false; // Not handled
}

// PART 6.6 - TAG AUTO-CLOSING & EDITOR KEYDOWN

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

    applyEditorMutation(
      editor,
      pos,
      editor.selectionEnd,
      ">" + closingTag,
      pos + 1,
      pos + 1,
    );
  }
}

function expandCxStartShortcut(editor) {
  if (!activeFile || activeFile.type !== "html") return false;

  const pos = editor.selectionStart;
  const textBefore = editor.value.substring(0, pos);
  const lineStart = textBefore.lastIndexOf("\n") + 1;
  const currentLine = textBefore.substring(lineStart);

  if (currentLine.trim() !== "cxstart") return false;

  const linePrefix = currentLine.match(/^\s*/)?.[0] || "";
  const replacement = getDefaultHtmlStarter()
    .split("\n")
    .map((line) => (line ? linePrefix + line : line))
    .join("\n");

  const bodyMatch = replacement.match(/<body>\n([\s\S]*?)\n<\/body>/i);
  const bodyContentOffset =
    bodyMatch && bodyMatch[1] ? replacement.indexOf(bodyMatch[1]) : replacement.length;
  const caretPos = lineStart + bodyContentOffset;
  applyEditorMutation(
    editor,
    lineStart,
    editor.selectionEnd,
    replacement,
    caretPos,
    caretPos,
  );
  return true;
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
        hideSuggestions();
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
      e.preventDefault();
      const selectedIndex = activeSuggestion > -1 ? activeSuggestion : 0;
      const selected = items[selectedIndex];
      if (selected) {
        selectSuggestion(selected.dataset.tag);
      } else {
        hideSuggestions();
      }
      return;
    } else if (e.key === "Escape") {
      e.preventDefault();
      hideSuggestions();
      return;
    } else if (e.key === ">") {
      // Handle tag closing, then hide popup
      handleTagClosing(e);
      hideSuggestions();
      return;
    }
  }

  // --- 2. Auto-Closing & Indentation (CSS and JS) ---
  if (activeFile.type === "html" && e.key === "=") {
    const start = editor.selectionStart;
    const end = editor.selectionEnd;
    const textBefore = editor.value.substring(0, start);
    const textAfter = editor.value.substring(end);

    // Auto-complete HTML attributes: href= -> href=""
    // Trigger only when caret is right after a likely attribute name.
    if (/[\w:-]\s*$/.test(textBefore)) {
      e.preventDefault();
      applyEditorMutation(editor, start, end, '=""', start + 2, start + 2);
      return;
    }
  }

  if (activeFile.type === "html" && e.key === "Enter") {
    if (expandCxStartShortcut(editor)) {
      e.preventDefault();
      return;
    }
  }

  // --- 3. Auto-Closing & Indentation (CSS and JS) ---
  if (
    activeFile.type === "css" ||
    activeFile.type === "js" ||
    (activeFile.type === "html" && (isInsideStyleTag(editor.value.substring(0, editor.selectionStart)) || isInsideScriptTag(editor.value.substring(0, editor.selectionStart))))
  ) {
    if (handleAutoCloseAndIndent(e, editor)) {
      return; // If auto-closing/indentation was handled, stop here
    }
  }

  // --- 4. HTML Tag Closing (If popup was not visible) ---
  if (activeFile.type === "html" && e.key === ">") {
    handleTagClosing(e);
    return;
  }

  // --- 5. Tab for Indentation (Fallback for all file types) ---
  if (e.key === "Tab") {
    e.preventDefault();
    const start = editor.selectionStart;
    const end = editor.selectionEnd;
    applyEditorMutation(
      editor,
      start,
      end,
      INDENT_UNIT,
      start + INDENT_UNIT.length,
      start + INDENT_UNIT.length,
    );
    return;
  }

  // All other keys fall through to default behavior
}

// PART 7 - KEYBOARD SHORTCUTS
document.addEventListener("keydown", (e) => {
  const key = e.key.toLowerCase();
  const mod = e.ctrlKey || e.metaKey;
  const target = e.target;
  const isTypingIntoFormControl =
    target &&
    target !== document.getElementById("activeEditor") &&
    ((typeof target.closest === "function" &&
      target.closest("input, textarea, select, button, [contenteditable='true']")) ||
      target.isContentEditable);

  if (e.key === "Escape" && document.body.classList.contains("zen-mode")) {
    e.preventDefault();
    toggleZenMode(false);
    return;
  }

  if (e.key === "Escape") {
    if (headerMorePanel && !headerMorePanel.hidden) {
      e.preventDefault();
      setHeaderMoreMenuOpen(false);
      return;
    }
    if (developerConsoleModal && developerConsoleModal.style.display === "flex") {
      e.preventDefault();
      closeDeveloperConsole();
      return;
    }
    if (fontPickerModal && fontPickerModal.style.display === "flex") {
      e.preventDefault();
      fontPickerModal.style.display = "none";
      return;
    }
    if (settingsModal && settingsModal.style.display === "flex") {
      e.preventDefault();
      settingsModal.style.display = "none";
      return;
    }
    if (collabModal && collabModal.style.display === "flex") {
      e.preventDefault();
      if (closeModalBtn && closeModalBtn.style.display !== "none") {
        closeModal();
      }
      return;
    }
  }

  // Prevent shortcuts from firing while suggestion box is open
  if (suggestionPopup.style.display === "block") {
    if (
      mod &&
      (key === "s" || key === "enter" || key === "q")
    ) {
      e.preventDefault();
    }
    return;
  }

  if (isTypingIntoFormControl) {
    return;
  }

  if (mod && key === "c") {
    setDeveloperChordArmed(true);
  } else if (developerChordArmed && mod && key === "x") {
    e.preventDefault();
    setDeveloperChordArmed(false);
    openDeveloperConsole();
    return;
  }

  if (mod && key === "s") {
    e.preventDefault();
    exportAsZip();
  }
  if (mod && key === "enter") {
    e.preventDefault();
    if (activeSessionId && isReadOnlyParticipant() && collabPermissions.disableRunCode) {
      showNotification("The host disabled running code for participants.", "error");
      return;
    }
    updatePreview();
  }
  if (mod && key === "q") {
    e.preventDefault();
    createNewFile();
  }
  if (mod && e.shiftKey && key === "c") {
    e.preventDefault();
    showConsoleCheckbox.checked = !showConsoleCheckbox.checked;
    showConsoleCheckbox.dispatchEvent(new Event("change"));
  }
});

document.addEventListener("keyup", (e) => {
  if (e.key === "Control" || e.key === "Meta") {
    setDeveloperChordArmed(false);
  }
});

document.addEventListener("mousedown", (e) => {
  const editor = document.getElementById("activeEditor");
  if (!editor) return;
  const clickedInsidePopup = suggestionPopup.contains(e.target);
  if (!clickedInsidePopup) {
    hideSuggestions();
  }
});

window.addEventListener("resize", () => {
  const editor = document.getElementById("activeEditor");
  if (editor && suggestionPopup.style.display === "block") {
    positionSuggestionPopup(editor);
  }
});

// PART 8 - DRAG & DROP
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
  if (activeSessionId && isReadOnlyParticipant() && collabPermissions.disableNewFile) {
    showNotification("The host disabled creating new files for participants.", "error");
    return;
  }
  for (const file of e.dataTransfer.files) {
    const reader = new FileReader();
    reader.onload = (ev) => {
      const content = ev.target.result;
      const ext = file.name.split(".").pop().toLowerCase();
      if (editableTextExtensions.includes(ext)) {
        if (projectFiles.some((f) => f.name.toLowerCase() === file.name.toLowerCase())) {
          showNotification(`File ${file.name} already exists`, "error");
          return;
        }
        const newFile = { name: file.name, type: ext, content, active: false };
        projectFiles.push(newFile);
        scheduleProjectAutosave();
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

document.getElementById("activeEditor").addEventListener("pointermove", announceCursorPosition);
document.getElementById("activeEditor").addEventListener("mouseenter", announceCursorPosition);
document.getElementById("activeEditor").addEventListener("mouseleave", clearOwnSessionCursorBroadcast);
window.addEventListener("beforeunload", clearOwnSessionCursorBroadcast);
setInterval(pruneRemoteCursors, 1000);

// PART 9 - ZIP EXPORT
async function exportAsZip() {
  if (activeSessionId && isReadOnlyParticipant() && collabPermissions.disableExportZip) {
    showNotification("The host disabled ZIP export for participants.", "error");
    return;
  }
  const dialog = await showAppPrompt(
    "EXPORT ZIP",
    "Name your ZIP file:",
    "codx-project.zip",
    "codx-project.zip",
  );
  if (!dialog?.ok) return;
  const requestedName = dialog.value;
  if (!requestedName) return;
  const trimmedName = requestedName.trim();
  if (!trimmedName) {
    showNotification("ZIP file name cannot be empty.", "error");
    return;
  }
  const zipFileName = /\.zip$/i.test(trimmedName) ? trimmedName : `${trimmedName}.zip`;
  const zip = new JSZip();
  projectFiles.forEach((file) => {
    zip.file(file.name, file.content);
  });
  try {
    const content = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(content);
    const a = document.createElement("a");
    a.href = url;
    a.download = zipFileName;
    a.click();
    URL.revokeObjectURL(url);
    showNotification(`Project exported as ${zipFileName}!`, "success");
  } catch (err) {
    console.error("Export error:", err);
    showNotification("Error creating ZIP file", "error");
  }
}

// PART 10 - ZIP IMPORT
function importZip() {
  if (activeSessionId && isReadOnlyParticipant() && collabPermissions.disableImportZip) {
    showNotification("The host disabled ZIP import for participants.", "error");
    return;
  }
  document.getElementById("zipFileInput").click();
}

function handleZipImport(event) {
  if (activeSessionId && isReadOnlyParticipant() && collabPermissions.disableImportZip) {
    showNotification("The host disabled ZIP import for participants.", "error");
    event.target.value = "";
    return;
  }
  const file = event.target.files[0];
  if (!file) return;

  if (!file.name.endsWith(".zip")) {
    showNotification("Please select a valid ZIP file", "error");
    return;
  }

  JSZip.loadAsync(file)
    .then((zip) => {
      const promises = [];
      const importedFiles = [];
      const foundFiles = [];

      zip.forEach((path, entry) => {
        const ext = path.split(".").pop().toLowerCase();
        if (editableTextExtensions.includes(ext) && !entry.dir) {
          foundFiles.push(path);
          promises.push(
            entry.async("string").then((content) => {
              importedFiles.push({
                name: path,
                type: ext,
                content,
                active: false,
              });
            }),
          );
        }
      });

      Promise.all(promises).then(() => {
        if (importedFiles.length === 0) {
          showNotification("No valid files found in ZIP", "error");
          return;
        }
        projectFiles = importedFiles;
        projectFiles[0].active = true;
        activeFile = projectFiles[0];
        const editor = document.getElementById("activeEditor");
        editor.value = activeFile.content;
        updateLineNumbers(editor);
        renderFileList();
        scheduleProjectAutosave();
        if (autoRunCheckbox.checked) updatePreview();
        syncProjectWithSession();
        showNotification(
          `Project imported! Files: ${foundFiles.join(", ")}`,
          "success",
        );
      });
    })
    .catch((err) => {
      console.error("Import error:", err);
      showNotification("Error reading ZIP file.", "error");
    });
  event.target.value = "";
}

// PART 11 - FULLSCREEN
previewFullscreenBtn.addEventListener("click", togglePreviewFullscreen);
zenModeBtn.addEventListener("click", toggleZenMode);
if (zenExitBtn) zenExitBtn.addEventListener("click", () => toggleZenMode(false));
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

// PART 12 - COLLABORATION FEATURES (SOCKET.IO BACKEND)
closeModalBtn.addEventListener("click", closeModal);
collabBtn.addEventListener("click", startCollaboration);
window.addEventListener("load", checkForSession);

function extractSessionIdFromUrl() {
  const pathMatch = window.location.pathname.match(
    /\/frontend\.html\/([A-Za-z0-9-]+)$/,
  );
  if (pathMatch) return pathMatch[1].toUpperCase();

  const hash = window.location.hash.substring(1).trim().toUpperCase();
  if (hash) return hash;
  return null;
}

function validateUsername(u) {
  if (!u || !u.trim()) return { valid: false, error: "Enter a name." };
  if (u.length < 2) return { valid: false, error: "At least 2 characters." };
  if (u.length > 20) return { valid: false, error: "Max 20 characters." };
  if (!/^[a-zA-Z0-9\s_-]+$/.test(u))
    return { valid: false, error: "Only letters, numbers, space, _ , -." };
  return { valid: true };
}

function getMyParticipant() {
  return collabParticipants.find((p) => p.name === myInfo.name) || null;
}

function getParticipantByName(name) {
  const safeName = String(name || "").trim().toLowerCase();
  return collabParticipants.find((p) => String(p.name || "").trim().toLowerCase() === safeName) || null;
}

function getCurrentHostName() {
  const hostParticipant = collabParticipants.find((p) => p.role === "host");
  if (hostParticipant?.name) return hostParticipant.name;
  return collabHostName || "";
}

function getMyRole() {
  const me = getMyParticipant();
  if (me?.role) return me.role;

  const hostName = getCurrentHostName();
  if (hostName && myInfo.name === hostName) return "host";
  return "participant";
}

function isHost() {
  return getMyRole() === "host";
}

function isCoHost() {
  return getMyRole() === "co-host";
}

function canUseCoHostTools() {
  return isHost() || isCoHost();
}

function canModerateParticipant(participant) {
  if (!participant) return false;
  const role = String(participant.role || "participant");
  if (isHost()) return role !== "host";
  if (isCoHost()) return role === "participant";
  return false;
}

function normalizeCollabPermissions(raw) {
  const next = {
    ...defaultCollabPermissions,
    ...(raw || {}),
  };
  const allNames = new Set(projectFiles.map((f) => f.name));
  next.selectedFiles = Array.isArray(next.selectedFiles)
    ? Array.from(
        new Set(
          next.selectedFiles
            .map((name) => String(name || "").trim())
            .filter((name) => name && allNames.has(name)),
        ),
      )
    : [];
  return next;
}

function isReadOnlyParticipant() {
  return activeSessionId && !isHost() && !isCoHost();
}

function canCurrentUserEditFile(fileName) {
  if (!activeSessionId || isHost() || isCoHost()) return true;
  const me = getMyParticipant();
  if (me?.frozenEditing) return false;
  const normalizedFileName = String(fileName || "").trim().toLowerCase();
  const hasPersonalFileAccess = Array.isArray(me?.allowedFiles);
  if (!hasPersonalFileAccess && !collabPermissions.manageSelectedFiles) return true;
  const allowedFiles = hasPersonalFileAccess ? me.allowedFiles : collabPermissions.selectedFiles;
  return allowedFiles.some(
    (name) => String(name || "").trim().toLowerCase() === normalizedFileName,
  );
}

function enforceCollabPermissionsUI() {
  if (!activeSessionId) {
    if (newFileBtn) {
      newFileBtn.disabled = false;
      newFileBtn.title = "";
    }
    if (exportZipBtn) {
      exportZipBtn.disabled = false;
      exportZipBtn.title = "";
    }
    if (importZipBtn) {
      importZipBtn.disabled = false;
      importZipBtn.title = "";
    }
    if (saveProjectBtn) {
      saveProjectBtn.disabled = false;
      saveProjectBtn.title = "";
    }
    if (openSavedProjectsBtn) {
      openSavedProjectsBtn.disabled = false;
      openSavedProjectsBtn.title = "";
    }
    if (templatesBtn) {
      templatesBtn.disabled = false;
      templatesBtn.title = "";
    }
    if (publishProjectBtn) {
      publishProjectBtn.disabled = false;
      publishProjectBtn.title = "";
    }
    if (runPreviewBtn) {
      runPreviewBtn.disabled = false;
      runPreviewBtn.title = "";
    }
    if (showConsoleCheckbox) {
      showConsoleCheckbox.disabled = false;
      showConsoleCheckbox.title = "";
    }
    if (clearConsoleBtn) {
      clearConsoleBtn.disabled = false;
      clearConsoleBtn.title = "";
    }
    const editor = document.getElementById("activeEditor");
    if (editor) {
      editor.readOnly = false;
      editor.title = "";
    }
    if (consoleContainer && showConsoleCheckbox && !showConsoleCheckbox.checked) {
      consoleContainer.classList.remove("show");
    }
    return;
  }

  const participantRestricted = isReadOnlyParticipant();
  const lockNewFile = participantRestricted && collabPermissions.disableNewFile;
  const lockExport = participantRestricted && collabPermissions.disableExportZip;
  const lockImport = participantRestricted && collabPermissions.disableImportZip;
  const lockSaveProject = participantRestricted && collabPermissions.disableSaveProject;
  const lockOpenSaved = participantRestricted && collabPermissions.disableOpenSavedProjects;
  const lockTemplates = participantRestricted && collabPermissions.disableTemplates;
  const lockPublishShare = participantRestricted && collabPermissions.disablePublishShare;
  const lockRun = participantRestricted && collabPermissions.disableRunCode;
  const lockConsole = participantRestricted && collabPermissions.disableConsoleAccess;
  const globalReadOnly = activeSessionId && (collabPermissions.readOnlyAll || collabPermissions.pauseCollab);
  const lockEditor = globalReadOnly || !canCurrentUserEditFile(activeFile ? activeFile.name : "");
  const me = getMyParticipant();
  const frozenEditing = participantRestricted && Boolean(me?.frozenEditing);

  if (newFileBtn) {
    newFileBtn.disabled = lockNewFile;
    newFileBtn.title = lockNewFile ? "The host disabled new file creation." : "";
  }
  if (exportZipBtn) {
    exportZipBtn.disabled = lockExport;
    exportZipBtn.title = lockExport ? "The host disabled ZIP export." : "";
  }
  if (importZipBtn) {
    importZipBtn.disabled = lockImport;
    importZipBtn.title = lockImport ? "The host disabled ZIP import." : "";
  }
  if (saveProjectBtn) {
    saveProjectBtn.disabled = lockSaveProject;
    saveProjectBtn.title = lockSaveProject ? "The host disabled saving projects for participants." : "";
  }
  if (openSavedProjectsBtn) {
    openSavedProjectsBtn.disabled = lockOpenSaved;
    openSavedProjectsBtn.title = lockOpenSaved ? "The host disabled opening saved projects for participants." : "";
  }
  if (templatesBtn) {
    templatesBtn.disabled = lockTemplates;
    templatesBtn.title = lockTemplates ? "The host disabled starter templates for participants." : "";
  }
  if (publishProjectBtn) {
    publishProjectBtn.disabled = lockPublishShare;
    publishProjectBtn.title = lockPublishShare ? "The host disabled publish/share for participants." : "";
  }
  if (runPreviewBtn) {
    runPreviewBtn.disabled = lockRun;
    runPreviewBtn.title = lockRun ? "The host disabled code execution for participants." : "";
  }
  if (showConsoleCheckbox) {
    showConsoleCheckbox.disabled = lockConsole;
    showConsoleCheckbox.title = lockConsole ? "The host disabled console access for participants." : "";
    if (lockConsole) {
      showConsoleCheckbox.checked = false;
    }
  }
  if (clearConsoleBtn) {
    clearConsoleBtn.disabled = lockConsole;
    clearConsoleBtn.title = lockConsole ? "The host disabled console access for participants." : "";
  }
  const editor = document.getElementById("activeEditor");
  if (editor) {
    editor.readOnly = lockEditor;
    editor.title = lockEditor
      ? globalReadOnly
        ? collabPermissions.pauseCollab
          ? "The host paused collaboration for the group."
          : "The host set the room to read-only."
        : frozenEditing
        ? "The host temporarily froze your editing access."
        : "The host allowed editing only on selected files."
      : "";
  }
  if (consoleContainer) {
    consoleContainer.classList.toggle("show", showConsoleCheckbox.checked && !lockConsole);
  }
  applyRoomIndicators();
}

function updateZenModeButtonState() {
  if (!zenModeBtn) return;
  if (isZenMode) {
    zenModeBtn.innerHTML = `
      <i class="fa-solid fa-minimize"></i>
      <strong>EXIT ZEN</strong>
    `;
  } else {
    zenModeBtn.innerHTML = `
      <i class="fa-solid fa-laptop-code"></i>
      <strong>ZEN MODE</strong>
    `;
  }
}

function toggleZenMode(forceState) {
  isZenMode =
    typeof forceState === "boolean" ? forceState : !document.body.classList.contains("zen-mode");
  document.body.classList.toggle("zen-mode", isZenMode);
  updateZenModeButtonState();
  updateLineNumbers(editorTextarea);
  renderErrorHighlights(editorTextarea);
  setTimeout(() => {
    if (editorTextarea) {
      editorTextarea.focus();
      syncSyntaxLayerStyle(editorTextarea);
      renderSyntaxHighlight(editorTextarea);
      renderErrorHighlights(editorTextarea);
    }
  }, 0);
  if (isZenMode) {
    showNotification("Zen Mode enabled. Press Esc to exit.", "success");
  }
}

function pushCollabPermissionsUpdate(partial) {
  if (!collabSocket || !activeSessionId || !isHost()) return;
  const next = normalizeCollabPermissions({
    ...collabPermissions,
    ...(partial || {}),
  });
  collabSocket.emit(
    "collab:set-permissions",
    { sessionId: activeSessionId, permissions: next },
    (res) => {
      if (!res?.ok) {
        showNotification((res && res.error) || "Failed to update permissions", "error");
      }
    },
  );
}

function updateGroupPermission(partial, successMessage) {
  if (!collabSocket || !activeSessionId || !isHost()) return;
  const next = normalizeCollabPermissions({
    ...collabPermissions,
    ...(partial || {}),
  });
  collabSocket.emit(
    "collab:set-permissions",
    { sessionId: activeSessionId, permissions: next },
    (res) => {
      if (!res?.ok) {
        showNotification((res && res.error) || "Failed to update room setting", "error");
      } else {
        collabPermissions = normalizeCollabPermissions(res.permissions || next);
        enforceCollabPermissionsUI();
        applyRoomIndicators();
        if (collabModal.style.display === "flex") {
          if (collabModalView === "group-controls") {
            showGroupControls(activeSessionId);
          } else if (collabModalView === "session") {
            showSessionDetails(activeSessionId);
          }
        }
        if (successMessage) showNotification(successMessage, "success");
      }
    },
  );
}

async function promptForExistingFile(label, currentValue = "") {
  const existingNames = projectFiles.map((file) => file.name).join(", ");
  const dialog = await showAppPrompt(
    "SELECT FILE",
    `${label}\nAvailable files: ${existingNames}`,
    currentValue || (activeFile ? activeFile.name : ""),
    activeFile ? activeFile.name : "",
  );
  if (!dialog?.ok) {
    return { status: "cancel" };
  }
  const picked = dialog.value;
  const trimmed = String(picked || "").trim();
  if (!trimmed) {
    return { status: "empty" };
  }
  const match = projectFiles.find((file) => file.name.toLowerCase() === trimmed.toLowerCase());
  return match ? { status: "ok", fileName: match.name } : { status: "invalid" };
}

async function bringEveryoneToFile() {
  if (!collabSocket || !activeSessionId || !canUseCoHostTools()) return;
  const result = await promptForExistingFile("Bring everyone to which file?", activeFile ? activeFile.name : "");
  if (result.status === "cancel") return;
  if (result.status !== "ok") {
    showNotification("Choose an existing file name.", "error");
    return;
  }
  const fileName = result.fileName;
  collabSocket.emit("collab:bring-to-file", { sessionId: activeSessionId, fileName }, (res) => {
    if (!res?.ok) {
      showNotification((res && res.error) || "Failed to bring everyone to file", "error");
      return;
    }
    showNotification(`Everyone was brought to ${fileName}.`, "success");
  });
}

function clearGroupChat() {
  if (!collabSocket || !activeSessionId || !canUseCoHostTools()) return;
  collabSocket.emit("collab:clear-group-chat", { sessionId: activeSessionId }, (res) => {
    if (!res?.ok) {
      showNotification((res && res.error) || "Failed to clear group chat", "error");
      return;
    }
    showNotification("Group chat cleared.", "success");
  });
}

function saveSessionSnapshot() {
  if (!collabSocket || !activeSessionId || !isHost()) return;
  collabSocket.emit("collab:save-snapshot", { sessionId: activeSessionId }, (res) => {
    if (!res?.ok || !res.snapshot) {
      showNotification((res && res.error) || "Failed to save session snapshot", "error");
      return;
    }
    const blob = new Blob([JSON.stringify(res.snapshot, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `codx-session-${activeSessionId}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
    showNotification("Session snapshot saved.", "success");
  });
}

function regenerateInviteLink() {
  if (!collabSocket || !activeSessionId || !isHost()) return;
  collabSocket.emit("collab:regenerate-link", { sessionId: activeSessionId }, (res) => {
    if (!res?.ok) {
      showNotification((res && res.error) || "Failed to regenerate link", "error");
      return;
    }
    activeSessionId = res.sessionId || activeSessionId;
    collabShareLink = res.shareLink || collabShareLink;
    window.history.replaceState({}, "", `/frontend.html/${activeSessionId}`);
    showNotification("Invite link regenerated.", "success");
    showGroupControls(activeSessionId);
  });
}

async function endSessionForEveryone() {
  if (!collabSocket || !activeSessionId || !isHost()) return;
  const dialog = await showAppConfirm(
    "END SESSION",
    "End the collaboration session for everyone?",
    "END SESSION",
    "CANCEL",
    "background:#d32f2f;",
  );
  if (!dialog?.ok) return;
  collabSocket.emit("collab:end-session", { sessionId: activeSessionId }, (res) => {
    if (!res?.ok) {
      showNotification((res && res.error) || "Failed to end session", "error");
    }
  });
}

function approveJoinRequest(socketId) {
  if (!collabSocket || !activeSessionId || !isHost()) return;
  collabSocket.emit("collab:approve-join", { sessionId: activeSessionId, socketId }, (res) => {
    if (!res?.ok) {
      showNotification((res && res.error) || "Failed to approve join request", "error");
      return;
    }
    showNotification("Join request approved.", "success");
  });
}

function rejectJoinRequest(socketId) {
  if (!collabSocket || !activeSessionId || !isHost()) return;
  collabSocket.emit("collab:reject-join", { sessionId: activeSessionId, socketId }, (res) => {
    if (!res?.ok) {
      showNotification((res && res.error) || "Failed to reject join request", "error");
      return;
    }
    showNotification("Join request rejected.", "success");
  });
}

function showJoinPendingState(sessionId, name) {
  joinRequestContext = { sessionId, name };
  collabModalView = "join-pending";
  setCollabCloseButtonVisible(false);
  modalTitle.innerHTML = "<strong>WAITING FOR APPROVAL</strong>";
  modalBody.innerHTML = `
    <p style="margin:8px 0 16px;color:var(--text-primary);">
      Your request to join <strong>${escapeHtml(sessionId)}</strong> as <strong>${escapeHtml(name)}</strong> is waiting for the host.
    </p>
  `;
  setModalActions("");
  collabModal.style.display = "flex";
}

function showGroupControls(sessionId) {
  if (!canUseCoHostTools()) return;
  const hostView = isHost();
  const pendingHtml = collabPendingJoins.length
    ? collabPendingJoins
        .map(
          (entry) => `<div class="collab-pending-row">
            <div class="collab-participant-main">
              <span class="collab-participant-color" style="background:${escapeHtml(entry.theme || "#4CAF50")};"></span>
              <div class="collab-participant-text">
                <div class="collab-participant-name">${escapeHtml(entry.name)}</div>
                <div class="collab-participant-meta">Waiting for host approval</div>
              </div>
            </div>
            <span class="collab-pending-actions">
              <button class="run-button approve-join-btn" data-socket="${escapeHtml(entry.socketId)}" style="padding:4px 10px;"><strong>APPROVE</strong></button>
              <button class="run-button reject-join-btn" data-socket="${escapeHtml(entry.socketId)}" style="padding:4px 10px;background:#d32f2f;"><strong>REJECT</strong></button>
            </span>
          </div>`,
        )
        .join("")
    : `<div class="collab-section-note">No pending join requests.</div>`;

  collabModalView = "group-controls";
  setCollabCloseButtonVisible(true);
  modalTitle.innerHTML = "<strong>GROUP CONTROLS</strong>";
  modalBody.innerHTML = `
    <div class="collab-section-card">
      <h4 class="collab-section-title">Session Overview</h4>
      <div class="collab-meta-grid">
        <div class="collab-meta-item">
          <span class="collab-meta-label">Share Link</span>
          <span class="collab-meta-value">${escapeHtml(collabShareLink || `${window.location.origin}/frontend.html/${sessionId}`)}</span>
        </div>
        <div class="collab-meta-item">
          <span class="collab-meta-label">Timer</span>
          <span class="collab-meta-value">${collabPermissions.sessionEndsAt ? formatSessionTimeRemaining(collabPermissions.sessionEndsAt) : "Off"}</span>
        </div>
      </div>
    </div>
    <div class="collab-section-card">
      <h4 class="collab-section-title">${hostView ? "Room Controls" : "Co-Host Tools"}</h4>
      <div class="collab-action-grid">
      ${hostView ? `<button id="groupLockRoomBtn" class="run-button"><strong>${collabPermissions.roomLocked ? "UNLOCK ROOM" : "LOCK ROOM"}</strong></button>` : ""}
      ${hostView ? `<button id="groupReadOnlyBtn" class="run-button"><strong>${collabPermissions.readOnlyAll ? "DISABLE READ-ONLY" : "READ-ONLY FOR ALL"}</strong></button>` : ""}
      ${hostView ? `<button id="groupDisableChatBtn" class="run-button"><strong>${collabPermissions.disableAllChat ? "ENABLE CHAT" : "DISABLE CHAT FOR ALL"}</strong></button>` : ""}
      ${hostView ? `<button id="groupDisableSaveBtn" class="run-button"><strong>${collabPermissions.disableSaveProject ? "ENABLE SAVE PROJECT" : "DISABLE SAVE PROJECT"}</strong></button>` : ""}
      ${hostView ? `<button id="groupDisableOpenSavedBtn" class="run-button"><strong>${collabPermissions.disableOpenSavedProjects ? "ENABLE OPEN SAVED" : "DISABLE OPEN SAVED"}</strong></button>` : ""}
      ${hostView ? `<button id="groupDisableTemplatesBtn" class="run-button"><strong>${collabPermissions.disableTemplates ? "ENABLE TEMPLATES" : "DISABLE TEMPLATES"}</strong></button>` : ""}
      ${hostView ? `<button id="groupDisablePublishBtn" class="run-button"><strong>${collabPermissions.disablePublishShare ? "ENABLE PUBLISH" : "DISABLE PUBLISH / SHARE"}</strong></button>` : ""}
      ${hostView ? `<button id="groupDisableRunBtn" class="run-button"><strong>${collabPermissions.disableRunCode ? "ENABLE RUN" : "DISABLE RUN FOR PARTICIPANTS"}</strong></button>` : ""}
      ${hostView ? `<button id="groupDisableConsoleBtn" class="run-button"><strong>${collabPermissions.disableConsoleAccess ? "ENABLE CONSOLE" : "DISABLE CONSOLE FOR PARTICIPANTS"}</strong></button>` : ""}
      <button id="groupBringToFileBtn" class="run-button"><strong>BRING EVERYONE TO FILE</strong></button>
      <button id="groupPinFileBtn" class="run-button"><strong>${collabPermissions.pinnedFile ? "CHANGE PINNED FILE" : "PIN TEAM FILE"}</strong></button>
      <button id="groupClearChatBtn" class="run-button"><strong>CLEAR GROUP CHAT</strong></button>
      ${hostView ? `<button id="groupAnnouncementBtn" class="run-button"><strong>ANNOUNCEMENT BAR</strong></button>` : ""}
      ${hostView ? `<button id="groupPauseBtn" class="run-button"><strong>${collabPermissions.pauseCollab ? "RESUME COLLAB" : "PAUSE COLLAB"}</strong></button>` : ""}
      ${hostView ? `<button id="groupTimerBtn" class="run-button"><strong>SESSION TIMER</strong></button>` : ""}
      ${hostView ? `<button id="groupEndSessionBtn" class="run-button" style="background:#d32f2f;"><strong>END SESSION</strong></button>` : ""}
      ${hostView ? `<button id="groupSnapshotBtn" class="run-button"><strong>SAVE SESSION SNAPSHOT</strong></button>` : ""}
      ${hostView ? `<button id="groupRegenLinkBtn" class="run-button"><strong>REGENERATE INVITE LINK</strong></button>` : ""}
      ${hostView ? `<button id="groupApprovalBtn" class="run-button"><strong>${collabPermissions.requireJoinApproval ? "DISABLE APPROVAL" : "APPROVE NEW JOINS"}</strong></button>` : ""}
      ${hostView ? `<button id="groupHighlightBtn" class="run-button"><strong>${collabPermissions.groupHighlightFile ? "CHANGE TEAM FOCUS" : "GROUP HIGHLIGHT MODE"}</strong></button>` : ""}
      ${hostView ? `<button id="groupQuietBtn" class="run-button"><strong>${collabPermissions.quietMode ? "DISABLE QUIET MODE" : "QUIET MODE"}</strong></button>` : ""}
      <button id="groupDoneBtn" class="run-button"><strong>DONE</strong></button>
    </div>
    </div>
    ${hostView ? `<div class="collab-section-card">
    <h4 class="collab-section-title">Pending Join Requests</h4>
    <div class="collab-participant-list">${pendingHtml}</div>
    </div>` : ""}
  `;
  setModalActions("");
  collabModal.style.display = "flex";

  const bind = (id, handler) => {
    const btn = document.getElementById(id);
    if (btn) btn.onclick = handler;
  };
  bind("groupLockRoomBtn", () =>
    updateGroupPermission({ roomLocked: !collabPermissions.roomLocked }, collabPermissions.roomLocked ? "Room unlocked." : "Room locked."),
  );
  bind("groupReadOnlyBtn", () =>
    updateGroupPermission({ readOnlyAll: !collabPermissions.readOnlyAll }, collabPermissions.readOnlyAll ? "Read-only disabled." : "Room set to read-only."),
  );
  bind("groupDisableChatBtn", () =>
    updateGroupPermission({ disableAllChat: !collabPermissions.disableAllChat }, collabPermissions.disableAllChat ? "Chat enabled." : "Chat disabled for the group."),
  );
  bind("groupDisableSaveBtn", () =>
    updateGroupPermission(
      { disableSaveProject: !collabPermissions.disableSaveProject },
      collabPermissions.disableSaveProject ? "Save Project enabled for participants." : "Save Project disabled for participants.",
    ),
  );
  bind("groupDisableOpenSavedBtn", () =>
    updateGroupPermission(
      { disableOpenSavedProjects: !collabPermissions.disableOpenSavedProjects },
      collabPermissions.disableOpenSavedProjects ? "Open Saved enabled for participants." : "Open Saved disabled for participants.",
    ),
  );
  bind("groupDisableTemplatesBtn", () =>
    updateGroupPermission(
      { disableTemplates: !collabPermissions.disableTemplates },
      collabPermissions.disableTemplates ? "Templates enabled for participants." : "Templates disabled for participants.",
    ),
  );
  bind("groupDisablePublishBtn", () =>
    updateGroupPermission(
      { disablePublishShare: !collabPermissions.disablePublishShare },
      collabPermissions.disablePublishShare ? "Publish / Share enabled for participants." : "Publish / Share disabled for participants.",
    ),
  );
  bind("groupDisableRunBtn", () =>
    updateGroupPermission(
      { disableRunCode: !collabPermissions.disableRunCode },
      collabPermissions.disableRunCode ? "Run access enabled for participants." : "Run access disabled for participants.",
    ),
  );
  bind("groupDisableConsoleBtn", () =>
    updateGroupPermission(
      { disableConsoleAccess: !collabPermissions.disableConsoleAccess },
      collabPermissions.disableConsoleAccess ? "Console access enabled for participants." : "Console access disabled for participants.",
    ),
  );
  bind("groupBringToFileBtn", bringEveryoneToFile);
  bind("groupPinFileBtn", async () => {
    const result = await promptForExistingFile("Pin which file for the team? Leave blank to clear.", collabPermissions.pinnedFile || (activeFile ? activeFile.name : ""));
    if (result.status === "cancel") return;
    if (result.status === "empty") {
      updateGroupPermission({ pinnedFile: "" }, "Pinned file cleared.");
      return;
    }
    if (result.status !== "ok") {
      showNotification("Choose an existing file name.", "error");
      return;
    }
    updateGroupPermission({ pinnedFile: result.fileName }, `Pinned ${result.fileName} for the team.`);
  });
  bind("groupClearChatBtn", clearGroupChat);
  bind("groupAnnouncementBtn", async () => {
    const dialog = await showAppPrompt(
      "ANNOUNCEMENT BAR",
      "Enter the announcement text. Leave it empty to clear.",
      collabPermissions.announcementBar || "",
      "Type announcement here",
    );
    if (!dialog?.ok) return;
    const text = String(dialog.value || "");
    updateGroupPermission({ announcementBar: text.trim() }, text.trim() ? "Announcement updated." : "Announcement cleared.");
  });
  bind("groupPauseBtn", () =>
    updateGroupPermission({ pauseCollab: !collabPermissions.pauseCollab }, collabPermissions.pauseCollab ? "Collaboration resumed." : "Collaboration paused."),
  );
  bind("groupTimerBtn", async () => {
    const currentMinutes = collabPermissions.sessionEndsAt ? Math.max(1, Math.ceil((collabPermissions.sessionEndsAt - Date.now()) / 60000)) : 15;
    const dialog = await showAppPrompt(
      "SESSION TIMER",
      "Set session timer in minutes. Enter 0 to clear.",
      String(currentMinutes),
      "15",
    );
    if (!dialog?.ok) return;
    const value = dialog.value;
    const minutes = Math.max(0, Number(value));
    if (!Number.isFinite(minutes)) {
      showNotification("Enter a valid number of minutes.", "error");
      return;
    }
    updateGroupPermission(
      { sessionEndsAt: minutes > 0 ? Date.now() + minutes * 60000 : null },
      minutes > 0 ? `Session timer set for ${minutes} minute(s).` : "Session timer cleared.",
    );
  });
  bind("groupEndSessionBtn", endSessionForEveryone);
  bind("groupSnapshotBtn", saveSessionSnapshot);
  bind("groupRegenLinkBtn", regenerateInviteLink);
  bind("groupApprovalBtn", () =>
    updateGroupPermission(
      { requireJoinApproval: !collabPermissions.requireJoinApproval },
      collabPermissions.requireJoinApproval ? "Join approval disabled." : "Join approval enabled.",
    ),
  );
  bind("groupHighlightBtn", async () => {
    const result = await promptForExistingFile("Highlight which file for the group? Leave blank to clear.", collabPermissions.groupHighlightFile || (activeFile ? activeFile.name : ""));
    if (result.status === "cancel") return;
    if (result.status === "empty") {
      updateGroupPermission({ groupHighlightFile: "" }, "Team focus cleared.");
      return;
    }
    if (result.status !== "ok") {
      showNotification("Choose an existing file name.", "error");
      return;
    }
    updateGroupPermission({ groupHighlightFile: result.fileName }, `Team focus set to ${result.fileName}.`);
  });
  bind("groupQuietBtn", () =>
    updateGroupPermission({ quietMode: !collabPermissions.quietMode }, collabPermissions.quietMode ? "Quiet mode disabled." : "Quiet mode enabled."),
  );
  bind("groupDoneBtn", () => showSessionDetails(sessionId));

  if (hostView) {
    modalBody.querySelectorAll(".approve-join-btn").forEach((btn) => {
      btn.addEventListener("click", () => approveJoinRequest(btn.getAttribute("data-socket") || ""));
    });
    modalBody.querySelectorAll(".reject-join-btn").forEach((btn) => {
      btn.addEventListener("click", () => rejectJoinRequest(btn.getAttribute("data-socket") || ""));
    });
  }
}

function setCoHost(targetName, makeCoHost) {
  if (!collabSocket || !activeSessionId || !isHost()) return;
  collabSocket.emit(
    "collab:set-role",
    {
      sessionId: activeSessionId,
      targetName,
      role: makeCoHost ? "co-host" : "participant",
    },
    (res) => {
      if (!res?.ok) {
        showNotification((res && res.error) || "Failed to update participant role", "error");
      } else if (collabModal.style.display === "flex") {
        showSessionDetails(activeSessionId);
      }
    },
  );
}

function updateParticipantFlags(targetName, partial, successMessage) {
  if (!collabSocket || !activeSessionId || !canUseCoHostTools()) return;
  const participant = getParticipantByName(targetName);
  if (!canModerateParticipant(participant)) {
    showNotification("You do not have permission to update this participant.", "error");
    return;
  }
  collabSocket.emit(
    "collab:set-participant-flags",
    {
      sessionId: activeSessionId,
      targetName,
      ...(partial || {}),
    },
    (res) => {
      if (!res?.ok) {
        showNotification((res && res.error) || "Failed to update participant", "error");
      } else {
        if (successMessage) showNotification(successMessage, "success");
        showParticipantActions(targetName);
      }
    },
  );
}

function transferHostToParticipant(targetName) {
  if (!collabSocket || !activeSessionId || !isHost()) return;
  collabSocket.emit(
    "collab:transfer-host",
    { sessionId: activeSessionId, targetName },
    (res) => {
      if (!res?.ok) {
        showNotification((res && res.error) || "Failed to transfer host", "error");
      } else {
        showNotification(`${targetName} is now the host.`, "success");
        showSessionDetails(activeSessionId);
      }
    },
  );
}

function stopFollowingParticipant(showToast = true) {
  if (!followedParticipantName) return;
  const previousName = followedParticipantName;
  followedParticipantName = "";
  if (showToast) {
    showNotification(`Stopped following ${previousName}.`, "info");
  }
}

function showTransferHostConfirmation(targetName) {
  if (!isHost()) return;
  const safeName = String(targetName || "").trim();
  if (!safeName) return;

  collabModalView = "participant-actions";
  setCollabCloseButtonVisible(true);
  modalTitle.innerHTML = "<strong>TRANSFER HOST</strong>";
  modalBody.innerHTML = `
    <p style="margin: 8px 0 16px; color: var(--text-primary);">
      Are you sure you want to transfer host to <strong>${escapeHtml(safeName)}</strong>?
    </p>
  `;
  setModalActions(`
    <button id="transferHostYesBtn" class="run-button" style="background:#d32f2f;"><strong>YES</strong></button>
    <button id="transferHostNoBtn" class="run-button" style="background:#2e7d32;"><strong>NO</strong></button>
  `);
  collabModal.style.display = "flex";

  const yesBtn = document.getElementById("transferHostYesBtn");
  const noBtn = document.getElementById("transferHostNoBtn");
  if (yesBtn) yesBtn.onclick = () => transferHostToParticipant(safeName);
  if (noBtn) noBtn.onclick = () => showParticipantActions(safeName);
}

function updateParticipantAllowedFiles(targetName, allowedFiles, reset = false) {
  if (!collabSocket || !activeSessionId || !canUseCoHostTools()) return;
  const participant = getParticipantByName(targetName);
  if (!canModerateParticipant(participant)) {
    showNotification("You do not have permission to update this file access.", "error");
    return;
  }
  collabSocket.emit(
    "collab:set-participant-files",
    {
      sessionId: activeSessionId,
      targetName,
      allowedFiles,
      reset,
    },
    (res) => {
      if (!res?.ok) {
        showNotification((res && res.error) || "Failed to update file access", "error");
      } else {
        showNotification(
          reset ? `${targetName}'s file access was reset.` : `${targetName}'s file access updated.`,
          "success",
        );
        showParticipantActions(targetName);
      }
    },
  );
}

function formatParticipantJoinedAt(ts) {
  if (!ts) return "Unknown";
  try {
    return new Date(ts).toLocaleString();
  } catch {
    return "Unknown";
  }
}

function showParticipantDetails(targetName) {
  if (!canUseCoHostTools()) return;
  const participant = getParticipantByName(targetName);
  if (!canModerateParticipant(participant)) return;
  const allowedText = Array.isArray(participant.allowedFiles)
    ? participant.allowedFiles.length
      ? participant.allowedFiles.join(", ")
      : "No file access"
    : "Using session file access";
  collabModalView = "participant-actions";
  setCollabCloseButtonVisible(true);
  modalTitle.innerHTML = "<strong>PARTICIPANT DETAILS</strong>";
  modalBody.innerHTML = `
    <div style="text-align:left;display:grid;gap:10px;">
      <p><strong>Name:</strong> ${escapeHtml(participant.name)}</p>
      <p><strong>Role:</strong> ${escapeHtml(participant.role || "participant")}</p>
      <p><strong>Current file:</strong> ${escapeHtml(participant.currentFile || "None")}</p>
      <p><strong>Joined:</strong> ${escapeHtml(formatParticipantJoinedAt(participant.joinedAt))}</p>
      <p><strong>Chat:</strong> ${participant.mutedChat ? "Muted" : "Enabled"}</p>
      <p><strong>Editing:</strong> ${participant.frozenEditing ? "Frozen" : "Enabled"}</p>
      <p><strong>Priority:</strong> ${participant.priority ? "Marked" : "Normal"}</p>
      <p><strong>File access:</strong> ${escapeHtml(allowedText)}</p>
    </div>
  `;
  setModalActions(`
    <button id="participantDetailsBackBtn" class="run-button"><strong>BACK</strong></button>
  `);
  const backBtn = document.getElementById("participantDetailsBackBtn");
  if (backBtn) backBtn.onclick = () => showParticipantActions(targetName);
  collabModal.style.display = "flex";
}

function showParticipantFileAccessEditor(targetName) {
  if (!canUseCoHostTools()) return;
  const participant = getParticipantByName(targetName);
  if (!canModerateParticipant(participant)) return;
  const currentSet = new Set(Array.isArray(participant.allowedFiles) ? participant.allowedFiles : []);
  const options = projectFiles
    .map((file) => `
      <label class="file-access-option">
        <span class="file-access-check">
          <input type="checkbox" value="${escapeHtml(file.name)}" ${currentSet.has(file.name) ? "checked" : ""}>
          <span class="file-access-box" aria-hidden="true"></span>
        </span>
        <span class="file-access-name">${escapeHtml(file.name)}</span>
      </label>
    `)
    .join("");
  collabModalView = "participant-actions";
  setCollabCloseButtonVisible(true);
  modalTitle.innerHTML = "<strong>ALLOW FILE ACCESS</strong>";
  modalBody.innerHTML = `
    <p style="margin: 8px 0 12px; color: var(--text-primary);">
      Choose which files <strong>${escapeHtml(participant.name)}</strong> can edit.
    </p>
    <div id="participantFileAccessList" class="participant-file-access-list" style="text-align:left;max-height:220px;overflow:auto;border:1px solid var(--border-color);border-radius:8px;padding:10px;background:var(--bg-primary);">
      ${options || `<div style="color:var(--text-muted);">No files available.</div>`}
    </div>
  `;
  setModalActions(`
    <button id="participantFileAccessSaveBtn" class="run-button"><strong>SAVE</strong></button>
    <button id="participantFileAccessResetBtn" class="run-button"><strong>RESET ACCESS</strong></button>
    <button id="participantFileAccessBackBtn" class="run-button"><strong>BACK</strong></button>
  `);
  const saveBtn = document.getElementById("participantFileAccessSaveBtn");
  const resetBtn = document.getElementById("participantFileAccessResetBtn");
  const backBtn = document.getElementById("participantFileAccessBackBtn");
  if (saveBtn) {
    saveBtn.onclick = () => {
      const inputs = Array.from(
        document.querySelectorAll("#participantFileAccessList input[type='checkbox']:checked"),
      );
      updateParticipantAllowedFiles(
        participant.name,
        inputs.map((input) => input.value),
        false,
      );
    };
  }
  if (resetBtn) {
    resetBtn.onclick = () => updateParticipantAllowedFiles(participant.name, [], true);
  }
  if (backBtn) backBtn.onclick = () => showParticipantActions(targetName);
  collabModal.style.display = "flex";
}

function followParticipant(targetName) {
  const participant = getParticipantByName(targetName);
  if (!participant || !participant.currentFile) {
    showNotification("That participant is not on a specific file yet.", "info");
    return;
  }
  followedParticipantName = participant.name;
  switchFile(participant.currentFile);
  showNotification(`Following ${participant.name} to ${participant.currentFile}`, "success");
}

function syncFollowedParticipantView() {
  if (!followedParticipantName) return;
  const participant = getParticipantByName(followedParticipantName);
  if (!participant) {
    stopFollowingParticipant(false);
    showNotification("Stopped following because that participant left the session.", "info");
    return;
  }
  if (!participant.currentFile) return;
  if (!activeFile || activeFile.name !== participant.currentFile) {
    switchFile(participant.currentFile);
  }
}

function getPrivateChatCandidates() {
  return collabParticipants.filter((p) => p.name !== myInfo.name);
}

function getCurrentChatMessages() {
  if (collabChatMode === "private") {
    const target = collabChatTarget;
    if (!target) return [];
    return collabPrivateMessages.filter(
      (m) =>
        (m.from === myInfo.name && m.to === target) ||
        (m.from === target && m.to === myInfo.name),
    );
  }
  return collabGroupMessages;
}

function formatChatTime(ts) {
  try {
    return new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } catch {
    return "";
  }
}

function getParticipantThemeByName(name) {
  const p = collabParticipants.find((entry) => entry.name === name);
  return (p && p.theme) || "#4CAF50";
}

function renderCollabChatMessages() {
  const listEl = document.getElementById("collabChatMessages");
  if (!listEl) return;

  const messages = getCurrentChatMessages();
  if (!messages.length) {
    listEl.innerHTML = `<div style="color:var(--text-muted);font-size:12px;">No messages yet.</div>`;
    return;
  }

  listEl.innerHTML = messages
    .map((m) => {
      const mine = m.from === myInfo.name;
      const senderTheme = m.fromTheme || getParticipantThemeByName(m.from);
      return `<div style="margin-bottom:8px; padding:8px; border:1px solid var(--border-color); border-radius:8px; background:${mine ? "color-mix(in srgb, var(--accent-color) 15%, var(--bg-tertiary))" : "var(--bg-tertiary)"};">
        <div style="display:flex;justify-content:space-between;gap:10px;font-size:11px;color:var(--text-muted);">
          <span><span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${escapeHtml(senderTheme)};margin-right:6px;vertical-align:middle;"></span><strong style="color:${escapeHtml(senderTheme)};">${escapeHtml(m.from)}</strong>${m.to ? ` to <strong>${escapeHtml(m.to)}</strong>` : ""}</span>
          <span>${escapeHtml(formatChatTime(m.ts || Date.now()))}</span>
        </div>
        <div style="margin-top:4px;color:var(--text-primary);white-space:pre-wrap;word-break:break-word;">${escapeHtml(m.text || "")}</div>
      </div>`;
    })
    .join("");

  listEl.scrollTop = listEl.scrollHeight;
}

function buildCollabChatPanelHtml() {
  const privateCandidates = getPrivateChatCandidates();
  if (!collabChatTarget && privateCandidates.length) {
    collabChatTarget = privateCandidates[0].name;
  }
  if (collabChatTarget && !privateCandidates.some((p) => p.name === collabChatTarget)) {
    collabChatTarget = privateCandidates[0] ? privateCandidates[0].name : "";
  }
  if (collabChatMode === "private" && !collabChatTarget) {
    collabChatMode = "group";
  }

  const groupDisabled = collabPermissions.disableGroupChat || collabPermissions.disableAllChat;
  const chatLocked = collabPermissions.disableAllChat;
  const groupOption = `<option value="group" ${collabChatMode === "group" ? "selected" : ""} ${groupDisabled ? "disabled" : ""}>Group Chat${groupDisabled ? " (disabled)" : ""}</option>`;
  const privateOption = `<option value="private" ${collabChatMode === "private" ? "selected" : ""}>Private Chat</option>`;
  const privateOptions = privateCandidates
    .map((p) => `<option value="${escapeHtml(p.name)}" ${p.name === collabChatTarget ? "selected" : ""}>${escapeHtml(p.name)}</option>`)
    .join("");

  return `
    <hr style="border-color:var(--border-color);margin:15px 0;">
    <h4 style="text-align:left;margin:0 0 10px;">Chat</h4>
    <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:8px;">
      <select id="collabChatMode" style="flex:1;min-width:140px;padding:8px;background:var(--bg-tertiary);border:1px solid var(--border-color);color:var(--text-primary);border-radius:6px;">
        ${groupOption}
        ${privateOption}
      </select>
      <select id="collabChatTarget" style="flex:1;min-width:140px;padding:8px;background:var(--bg-tertiary);border:1px solid var(--border-color);color:var(--text-primary);border-radius:6px;${collabChatMode === "private" ? "" : "display:none;"}">
        ${privateOptions}
      </select>
    </div>
    <div id="collabChatMessages" style="height:180px;overflow:auto;border:1px solid var(--border-color);border-radius:8px;padding:10px;background:var(--bg-primary);margin-bottom:8px;"></div>
    <div style="display:flex;gap:8px;">
      <input id="collabChatInput" type="text" maxlength="500" ${chatLocked ? "disabled" : ""} placeholder="${chatLocked ? "Chat is disabled by the host..." : "Type a message..."}" style="flex:1;padding:10px;background:var(--bg-tertiary);border:1px solid var(--border-color);color:var(--text-primary);border-radius:6px;">
      <button id="collabChatSendBtn" class="run-button" style="padding:8px 12px;" ${chatLocked ? "disabled" : ""}><strong>SEND</strong></button>
    </div>
  `;
}

function bindCollabChatControls() {
  const modeEl = document.getElementById("collabChatMode");
  const targetEl = document.getElementById("collabChatTarget");
  const inputEl = document.getElementById("collabChatInput");
  const sendBtn = document.getElementById("collabChatSendBtn");
  if (!modeEl || !inputEl || !sendBtn) return;

  modeEl.onchange = () => {
    collabChatMode = modeEl.value;
    if (targetEl) {
      targetEl.style.display = collabChatMode === "private" ? "" : "none";
      if (collabChatMode === "private" && !targetEl.value && targetEl.options.length) {
        targetEl.value = targetEl.options[0].value;
      }
      collabChatTarget = targetEl.value || collabChatTarget;
    }
    renderCollabChatMessages();
  };

  if (targetEl) {
    targetEl.onchange = () => {
      collabChatTarget = targetEl.value || "";
      renderCollabChatMessages();
    };
  }

  const send = () => {
    const text = (inputEl.value || "").trim();
    if (!text) return;
    if (!collabSocket || !activeSessionId) return;
    const payload = {
      sessionId: activeSessionId,
      mode: collabChatMode,
      text,
    };
    if (collabChatMode === "private") {
      payload.toName = collabChatTarget;
      if (!payload.toName) {
        showNotification("Select a participant for private chat.", "error");
        return;
      }
    }
    collabSocket.emit("collab:chat:send", payload, (res) => {
      if (!res?.ok) {
        showNotification((res && res.error) || "Failed to send message.", "error");
      } else {
        inputEl.value = "";
      }
    });
  };

  sendBtn.onclick = send;
  inputEl.onkeydown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      send();
    }
  };
}

function requestCollabChatHistory() {
  if (!collabSocket || !activeSessionId) return;
  collabSocket.emit("collab:chat:history", { sessionId: activeSessionId }, (res) => {
    if (!res?.ok) return;
    collabGroupMessages = Array.isArray(res.groupMessages) ? res.groupMessages : [];
    collabPrivateMessages = Array.isArray(res.privateMessages) ? res.privateMessages : [];
    renderCollabChatMessages();
  });
}

setInterval(() => {
  applyRoomIndicators();
  if (
    activeSessionId &&
    collabModal.style.display === "flex" &&
    collabModalView === "session" &&
    collabPermissions.sessionEndsAt
  ) {
    showSessionDetails(activeSessionId);
  }
}, 1000);

function requestKickParticipant(targetName) {
  if (!collabSocket || !activeSessionId || !canUseCoHostTools()) {
    showNotification("Only the host or co-host can kick participants.", "error");
    return;
  }
  const safeName = String(targetName || "").trim();
  if (!safeName) return;
  const participant = getParticipantByName(safeName);
  if (!canModerateParticipant(participant)) {
    showNotification("You do not have permission to kick this participant.", "error");
    return;
  }

  let ackReceived = false;
  const ackTimer = setTimeout(() => {
    if (!ackReceived) {
      showNotification(
        "Kick request timed out. Restart the collaboration server and try again.",
        "error",
      );
    }
  }, 2500);

  collabSocket.emit(
    "collab:kick",
    { sessionId: activeSessionId, targetName: safeName },
    (res) => {
      ackReceived = true;
      clearTimeout(ackTimer);
      if (!res?.ok) {
        showNotification((res && res.error) || "Failed to kick participant", "error");
      } else {
        showNotification(`${safeName} was removed from the session`, "success");
        showSessionDetails(activeSessionId);
      }
    },
  );
}

function copyTextValue(text, successMessage) {
  const value = String(text || "");
  if (!value) {
    showNotification("Nothing to copy.", "error");
    return;
  }
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard
      .writeText(value)
      .then(() => showNotification(successMessage || "Copied!", "success"))
      .catch(() => fallbackCopy(value, value));
    return;
  }
  fallbackCopy(value, value);
}

function openPrivateChatWithParticipant(targetName) {
  const safeName = String(targetName || "").trim();
  if (!safeName) return;
  collabChatMode = "private";
  collabChatTarget = safeName;
  showSessionDetails(activeSessionId);
  setTimeout(() => {
    const targetSelect = document.getElementById("collabChatTarget");
    const input = document.getElementById("collabChatInput");
    if (targetSelect) targetSelect.value = safeName;
    if (input) input.focus();
  }, 0);
}

function showParticipantActions(targetName) {
  if (!canUseCoHostTools()) return;
  const safeName = String(targetName || "").trim();
  if (!safeName) return;
  const participant = getParticipantByName(safeName);
  if (!participant || !canModerateParticipant(participant)) return;
  const hostView = isHost();

  collabModalView = "participant-actions";
  setCollabCloseButtonVisible(true);
  modalTitle.innerHTML = "<strong>PARTICIPANT OPTIONS</strong>";
  modalBody.innerHTML = `
    <div class="collab-section-card">
      <h4 class="collab-section-title">Participant</h4>
      <div class="collab-meta-grid">
        <div class="collab-meta-item">
          <span class="collab-meta-label">Name</span>
          <span class="collab-meta-value">${escapeHtml(safeName)}</span>
        </div>
        <div class="collab-meta-item">
          <span class="collab-meta-label">Role</span>
          <span class="collab-meta-value">${escapeHtml(participant.role || "participant")}</span>
        </div>
        <div class="collab-meta-item">
          <span class="collab-meta-label">Color</span>
          <span class="collab-meta-value"><span class="collab-participant-color" style="display:inline-block;vertical-align:middle;margin-right:8px;background:${escapeHtml(participant.theme || "#4CAF50")};"></span>${escapeHtml(participant.theme || "#4CAF50")}</span>
        </div>
        <div class="collab-meta-item">
          <span class="collab-meta-label">Current File</span>
          <span class="collab-meta-value">${escapeHtml(participant.currentFile || "None")}</span>
        </div>
      </div>
    </div>
    <div class="collab-section-card">
      <h4 class="collab-section-title">${hostView ? "Participant Controls" : "Moderator Controls"}</h4>
      <div class="collab-action-grid">
      ${hostView ? `<button id="participantRoleBtn" class="run-button">
        <strong>${participant.role === "co-host" ? "REMOVE CO-HOST" : "MAKE CO-HOST"}</strong>
      </button>` : ""}
      ${hostView ? `<button id="participantTransferHostBtn" class="run-button">
        <strong>TRANSFER HOST</strong>
      </button>` : ""}
      <button id="participantMessageBtn" class="run-button">
        <strong>MESSAGE</strong>
      </button>
      <button id="participantMuteChatBtn" class="run-button">
        <strong>${participant.mutedChat ? "UNMUTE CHAT" : "MUTE CHAT"}</strong>
      </button>
      <button id="participantFreezeBtn" class="run-button">
        <strong>${participant.frozenEditing ? "UNFREEZE EDITING" : "FREEZE EDITING"}</strong>
      </button>
      <button id="participantFileAccessBtn" class="run-button">
        <strong>ALLOW FILE ACCESS</strong>
      </button>
      <button id="participantResetAccessBtn" class="run-button">
        <strong>REMOVE PRIVATE ACCESS</strong>
      </button>
      <button id="participantFollowBtn" class="run-button">
        <strong>${participant.name === followedParticipantName ? "STOP FOLLOWING" : "FOLLOW USER"}</strong>
      </button>
      <button id="participantViewDetailsBtn" class="run-button">
        <strong>VIEW DETAILS</strong>
      </button>
      <button id="participantPriorityBtn" class="run-button">
        <strong>${participant.priority ? "REMOVE PRIORITY" : "MARK AS PRIORITY"}</strong>
      </button>
      <button id="participantCopyNameBtn" class="run-button">
        <strong>COPY NAME</strong>
      </button>
      <button id="participantCopyColorBtn" class="run-button">
        <strong>COPY COLOR</strong>
      </button>
      <button id="participantCopyRoleBtn" class="run-button">
        <strong>COPY ROLE</strong>
      </button>
      <button id="participantKickBtn" class="run-button" style="background:#d32f2f;">
        <strong>KICK</strong>
      </button>
      <button id="participantDoneBtn" class="run-button">
        <strong>DONE</strong>
      </button>
    </div>
    </div>
  `;
  setModalActions("");
  collabModal.style.display = "flex";

  const roleBtn = document.getElementById("participantRoleBtn");
  const transferHostBtn = document.getElementById("participantTransferHostBtn");
  const messageBtn = document.getElementById("participantMessageBtn");
  const muteChatBtn = document.getElementById("participantMuteChatBtn");
  const freezeBtn = document.getElementById("participantFreezeBtn");
  const fileAccessBtn = document.getElementById("participantFileAccessBtn");
  const resetAccessBtn = document.getElementById("participantResetAccessBtn");
  const followBtn = document.getElementById("participantFollowBtn");
  const viewDetailsBtn = document.getElementById("participantViewDetailsBtn");
  const priorityBtn = document.getElementById("participantPriorityBtn");
  const copyNameBtn = document.getElementById("participantCopyNameBtn");
  const copyColorBtn = document.getElementById("participantCopyColorBtn");
  const copyRoleBtn = document.getElementById("participantCopyRoleBtn");
  const kickBtn = document.getElementById("participantKickBtn");
  const doneBtn = document.getElementById("participantDoneBtn");
  if (hostView && roleBtn) {
    roleBtn.onclick = () => setCoHost(safeName, participant.role !== "co-host");
  }
  if (hostView && transferHostBtn) {
    transferHostBtn.onclick = () => showTransferHostConfirmation(safeName);
  }
  if (messageBtn) {
    messageBtn.onclick = () => openPrivateChatWithParticipant(safeName);
  }
  if (muteChatBtn) {
    muteChatBtn.onclick = () =>
      updateParticipantFlags(
        safeName,
        { mutedChat: !participant.mutedChat },
        participant.mutedChat ? `${safeName} can chat again.` : `${safeName} was muted.`,
      );
  }
  if (freezeBtn) {
    freezeBtn.onclick = () =>
      updateParticipantFlags(
        safeName,
        { frozenEditing: !participant.frozenEditing },
        participant.frozenEditing ? `${safeName} can edit again.` : `${safeName}'s editing was frozen.`,
      );
  }
  if (fileAccessBtn) {
    fileAccessBtn.onclick = () => showParticipantFileAccessEditor(safeName);
  }
  if (resetAccessBtn) {
    resetAccessBtn.onclick = () => updateParticipantAllowedFiles(safeName, [], true);
  }
  if (followBtn) {
    followBtn.onclick = () => {
      if (participant.name === followedParticipantName) {
        stopFollowingParticipant();
      } else {
        followParticipant(safeName);
      }
      showParticipantActions(safeName);
    };
  }
  if (viewDetailsBtn) {
    viewDetailsBtn.onclick = () => showParticipantDetails(safeName);
  }
  if (priorityBtn) {
    priorityBtn.onclick = () =>
      updateParticipantFlags(
        safeName,
        { priority: !participant.priority },
        participant.priority ? `${safeName} is no longer priority.` : `${safeName} was marked as priority.`,
      );
  }
  if (copyNameBtn) {
    copyNameBtn.onclick = () => copyTextValue(safeName, `${safeName} copied`);
  }
  if (copyColorBtn) {
    copyColorBtn.onclick = () =>
      copyTextValue(participant.theme || "#4CAF50", `${safeName}'s color copied`);
  }
  if (copyRoleBtn) {
    copyRoleBtn.onclick = () =>
      copyTextValue(participant.role || "participant", `${safeName}'s role copied`);
  }
  if (kickBtn) {
    kickBtn.onclick = () => showKickConfirmation(safeName);
  }
  if (doneBtn) {
    doneBtn.onclick = () => showSessionDetails(activeSessionId);
  }
}

function showKickConfirmation(targetName) {
  if (!isHost()) return;
  const safeName = String(targetName || "").trim();
  if (!safeName) return;

  collabModalView = "kick";
  setCollabCloseButtonVisible(true);
  modalTitle.innerHTML = "<strong>KICK PARTICIPANT</strong>";
  modalBody.innerHTML = `
    <p style="margin: 8px 0 16px; color: var(--text-primary);">
      Are you sure you want to kick <strong>${escapeHtml(safeName)}</strong>?
    </p>
  `;
  setModalActions(`
    <button id="kickYesBtn" class="run-button" style="background:#d32f2f;"><strong>YES</strong></button>
    <button id="kickNoBtn" class="run-button" style="background:#2e7d32;"><strong>NO</strong></button>
  `);

  const yesBtn = document.getElementById("kickYesBtn");
  const noBtn = document.getElementById("kickNoBtn");
  if (yesBtn) yesBtn.onclick = () => requestKickParticipant(safeName);
  if (noBtn) noBtn.onclick = () => showSessionDetails(activeSessionId);
}

function showKickedOutModal() {
  resetTransientCollabUiState();
  collabModalView = "kicked";
  setCollabCloseButtonVisible(false);
  modalTitle.innerHTML = "<strong>NOTICE</strong>";
  modalBody.innerHTML = `
    <p style="margin: 8px 0 16px; color: var(--text-primary);">
      You have been kicked out of the group by the host
    </p>
  `;
  setModalActions(`
    <button id="kickedOkBtn" class="run-button"><strong>OK</strong></button>
  `);
  collabModal.style.display = "flex";

  const okBtn = document.getElementById("kickedOkBtn");
  if (okBtn) {
    okBtn.onclick = () => {
      window.location.href = "/frontend.html";
    };
  }
}

function ensureCollabSocket() {
  if (collabSocket && collabSocket.connected) return true;
  if (typeof io !== "function") {
    showNotification("Collab backend unavailable. Start server first.", "error");
    return false;
  }

  collabSocket = io();
  collabSocket.on("connect_error", () => {
    showNotification("Unable to connect to collaboration server", "error");
  });
  collabSocket.on("disconnect", () => {
    clearOwnSessionCursorBroadcast();
    resetTransientCollabUiState();
    if (activeSessionId) {
      showNotification("Collaboration connection lost.", "warn");
    }
  });
  collabSocket.on("reconnect", () => {
    if (!activeSessionId || !myInfo.name) return;
    collabSocket.emit(
      "collab:resume",
      {
        sessionId: activeSessionId,
        name: myInfo.name,
        theme: myInfo.theme || "#4CAF50",
      },
      (res) => {
        if (!res?.ok) {
          showNotification(
            (res && res.error) || "Collaboration reconnected, but session resume failed.",
            "error",
          );
          return;
        }
        collabParticipants = res.participants || [];
        collabHostName =
          (collabParticipants.find((p) => p.role === "host") || {}).name ||
          res.hostName ||
          collabHostName;
        collabPermissions = normalizeCollabPermissions(res.permissions);
        applyRemoteSessionState(res.files, res.activeFileName, true);
        enforceCollabPermissionsUI();
        if (collabModal.style.display === "flex" && collabModalView === "session") {
          showSessionDetails(activeSessionId);
        }
        requestCollabChatHistory();
        showNotification("Collaboration reconnected.", "success");
      },
    );
  });

  collabSocket.on("collab:state", (payload) => {
    if (!payload || !payload.files) return;
    applyRemoteSessionState(payload.files, payload.activeFileName, false);
    if (
      followedParticipantName &&
      payload.user &&
      String(payload.user.name || "").trim().toLowerCase() ===
        String(followedParticipantName || "").trim().toLowerCase()
    ) {
      syncFollowedParticipantView();
    }
  });

  collabSocket.on("collab:typing", (indicator) => {
    updateTypingIndicatorUI(indicator);
  });

  collabSocket.on("collab:participants", (participants) => {
    collabParticipants = Array.isArray(participants) ? participants : [];
    const hostFromParticipants = collabParticipants.find((p) => p.role === "host")?.name;
    if (hostFromParticipants) {
      collabHostName = hostFromParticipants;
    }
    const allowedNames = new Set(collabParticipants.map((p) => p.name));
    Object.keys(remoteCursorState).forEach((key) => {
      if (!allowedNames.has(key)) delete remoteCursorState[key];
    });
    Object.keys(remoteTypingState).forEach((key) => {
      if (!allowedNames.has(key)) delete remoteTypingState[key];
    });
    renderRemoteCursors();
    enforceCollabPermissionsUI();
    syncFollowedParticipantView();
    if (collabModal.style.display === "flex" && activeSessionId && collabModalView === "session") {
      showSessionDetails(activeSessionId);
    }
  });

  collabSocket.on("collab:meta", (meta) => {
    if (!meta) return;
    const previousAnnouncement = String(collabPermissions.announcementBar || "").trim();
    collabHostName = meta.hostName || collabHostName;
    collabPermissions = normalizeCollabPermissions(meta.permissions);
    collabPendingJoins = Array.isArray(meta.pendingJoins) ? meta.pendingJoins : [];
    collabShareLink = meta.shareLink || collabShareLink;
    const nextAnnouncement = String(collabPermissions.announcementBar || "").trim();
    if (nextAnnouncement) {
      if (nextAnnouncement !== previousAnnouncement || nextAnnouncement !== lastAnnouncementText) {
        showAnnouncementPopup(nextAnnouncement);
        lastAnnouncementText = nextAnnouncement;
      }
    } else {
      lastAnnouncementText = "";
      closeAnnouncementPopup();
    }
    enforceCollabPermissionsUI();
    if (collabModal.style.display === "flex" && activeSessionId) {
      if (collabModalView === "session") {
        showSessionDetails(activeSessionId);
      } else if (collabModalView === "group-controls" && isHost()) {
        showGroupControls(activeSessionId);
      }
    }
  });

  collabSocket.on("collab:kicked", () => {
    showKickedOutModal();
  });

  collabSocket.on("collab:role-notice", (payload) => {
    const nextRole = String(payload?.role || "").trim().toLowerCase();
    const actorName = String(payload?.by || "The host").trim() || "The host";
    if (nextRole === "co-host") {
      showNotification(`${actorName} made you a co-host.`, "success");
      return;
    }
    if (nextRole === "participant") {
      showNotification(`${actorName} removed your co-host access.`, "info");
    }
  });

  collabSocket.on("collab:cursor", (payload) => {
    const cursor = payload && payload.cursor ? payload.cursor : null;
    if (!cursor || !cursor.name) {
      if (payload && payload.name && remoteCursorState[payload.name]) {
        delete remoteCursorState[payload.name];
        renderRemoteCursors();
      }
      return;
    }
    remoteCursorState[cursor.name] = cursor;
    renderRemoteCursors();
  });

  collabSocket.on("collab:chat:group", (message) => {
    if (!message) return;
    collabGroupMessages.push(message);
    if (collabGroupMessages.length > 300) collabGroupMessages.shift();
    renderCollabChatMessages();
  });

  collabSocket.on("collab:chat:private", (message) => {
    if (!message) return;
    collabPrivateMessages.push(message);
    if (collabPrivateMessages.length > 500) collabPrivateMessages.shift();
    renderCollabChatMessages();
  });

  collabSocket.on("collab:chat:cleared", (payload) => {
    if (payload?.mode === "group") {
      collabGroupMessages = [];
      renderCollabChatMessages();
      showNotification("Group chat was cleared.", "info");
    }
  });

  collabSocket.on("collab:bring-to-file", (payload) => {
    const fileName = String(payload?.fileName || "").trim();
    if (!fileName) return;
    switchFile(fileName);
    showNotification(`The host brought everyone to ${fileName}.`, "info");
  });

  collabSocket.on("collab:link-regenerated", (payload) => {
    if (!payload) return;
    activeSessionId = payload.sessionId || activeSessionId;
    collabShareLink = payload.shareLink || collabShareLink;
    window.history.replaceState({}, "", `/frontend.html/${activeSessionId}`);
    if (collabModal.style.display === "flex" && collabModalView === "session") {
      showSessionDetails(activeSessionId);
    }
  });

  collabSocket.on("collab:join-approved", (res) => {
    if (!res?.ok) return;
    activeSessionId = res.sessionId || activeSessionId;
    myInfo = { name: joinRequestContext.name || myInfo.name, theme: myInfo.theme };
    collabParticipants = res.participants || [];
    collabHostName =
      (collabParticipants.find((p) => p.role === "host") || {}).name ||
      res.hostName ||
      collabHostName;
    collabPermissions = normalizeCollabPermissions(res.permissions);
    collabShareLink = res.shareLink || collabShareLink;
    collabGroupMessages = [];
    collabPrivateMessages = [];
    collabChatMode = "group";
    collabChatTarget = "";
    applyRemoteSessionState(res.files, res.activeFileName, true);
    enforceCollabPermissionsUI();
    window.history.replaceState({}, "", `/frontend.html/${activeSessionId}`);
    showNotification(`Welcome, ${myInfo.name}!`, "success");
    startSyncing();
    closeModal();
  });

  collabSocket.on("collab:join-rejected", (payload) => {
    const reason = String(payload?.reason || "The host rejected your join request.");
    if (collabModalView === "join-pending" && joinRequestContext.sessionId) {
      renderJoinNameStep(joinRequestContext.sessionId, joinRequestContext.name);
      errorMsgEl.textContent = reason;
      errorMsgEl.style.display = "block";
      return;
    }
    showNotification(reason, "error");
  });

  collabSocket.on("collab:session-ended", (payload) => {
    resetTransientCollabUiState();
    activeSessionId = null;
    collabParticipants = [];
    collabPendingJoins = [];
    collabShareLink = "";
    collabPermissions = { ...defaultCollabPermissions };
    setCollabCloseButtonVisible(false);
    const reason = String(payload?.reason || "The collaboration session ended.");
    modalTitle.innerHTML = "<strong>SESSION ENDED</strong>";
    modalBody.innerHTML = `<p style="margin:8px 0 16px;color:var(--text-primary);">${escapeHtml(reason)}</p>`;
    setModalActions(`<button id="sessionEndedOkBtn" class="run-button"><strong>OK</strong></button>`);
    collabModal.style.display = "flex";
    const okBtn = document.getElementById("sessionEndedOkBtn");
    if (okBtn) {
      okBtn.onclick = () => {
        resetCollabUrlToFreshState();
        closeModal();
      };
    }
    showNotification(reason, "warn");
  });

  return true;
}

function applyRemoteSessionState(files, activeFileName, preferRemoteActive = false) {
  if (!Array.isArray(files) || !files.length) return;
  isApplyingRemoteState = true;
  try {
    const requestedActiveName = String(activeFileName || "").trim();
    const currentActiveName = activeFile ? activeFile.name : null;
    projectFiles = files;
    const nextActive =
      (preferRemoteActive ? projectFiles.find((f) => f.name === requestedActiveName) : null) ||
      projectFiles.find((f) => f.name === currentActiveName) ||
      projectFiles.find((f) => f.name === requestedActiveName) ||
      projectFiles.find((f) => f.active) ||
      projectFiles[0];
    activeFile = nextActive;
    projectFiles.forEach((f) => (f.active = f.name === nextActive.name));
    if (activeFile && activeFile.type === "html") {
      currentPreviewTarget = { mode: "html", fileName: activeFile.name };
    }

    const ed = document.getElementById("activeEditor");
    const currentPos = ed.selectionStart;
    ed.value = activeFile.content;
    ed.selectionStart = ed.selectionEnd = Math.min(currentPos, ed.value.length);
    updateLineNumbers(ed);
    renderFileList();
    enforceCollabPermissionsUI();
    renderRemoteCursors();
    if (autoRunCheckbox.checked) updatePreview();
  } finally {
    isApplyingRemoteState = false;
  }
}

function emitSessionUpdate() {
  if (!collabSocket || !activeSessionId || !myInfo.name) return;
  collabSocket.emit("collab:update", {
    sessionId: activeSessionId,
    files: projectFiles,
    activeFileName: activeFile ? activeFile.name : null,
    user: myInfo,
  });
}

function announceTyping(activeEditorId) {
  if (!collabSocket || !activeSessionId || !myInfo.name) return;
  clearTimeout(typingTimer);
  const editor = document.getElementById("activeEditor");
  collabSocket.emit("collab:typing", {
    sessionId: activeSessionId,
    indicator: {
      name: myInfo.name,
      theme: myInfo.theme,
      editor: activeEditorId,
      fileName: activeFile ? activeFile.name : null,
      caretPos: editor ? editor.selectionStart : 0,
    },
  });

  typingTimer = setTimeout(() => {
    if (!collabSocket || !activeSessionId) return;
    collabSocket.emit("collab:typing", {
      sessionId: activeSessionId,
      indicator: {
        stopped: true,
        fileName: activeFile ? activeFile.name : null,
      },
    });
  }, 1500);
}

function updateTypingIndicatorUI(ind) {
  if (ind && ind.name && ind.name !== myInfo.name) {
    if (ind.stopped) {
      delete remoteTypingState[ind.name];
    } else {
      remoteTypingState[ind.name] = ind;
    }
  }
  currentTypingIndicator = ind && !ind.stopped ? ind : null;
  const ed = document.getElementById("activeEditor");
  ed.style.boxShadow = "none";
  if (
    ind &&
    !ind.stopped &&
    ind.name !== myInfo.name &&
    !collabPermissions.quietMode &&
    ind.fileName === activeFile.name
  ) {
    ed.style.boxShadow = `0 0 0 3px ${ind.theme} inset`;
    typingIndicatorEl.textContent = `${ind.name} is typing...`;
    typingIndicatorEl.style.backgroundColor = ind.theme;
    typingIndicatorEl.style.display = "block";
  } else {
    typingIndicatorEl.style.display = "none";
  }
  renderRemoteCursors();
  renderFileList();
}

function getVisibleCursorParticipants() {
  return Object.values(remoteCursorState).filter(
    (entry) =>
      entry &&
      entry.name !== myInfo.name &&
      entry.fileName === (activeFile ? activeFile.name : "") &&
      Date.now() - Number(entry.ts || 0) < 4000,
  );
}

function getVisibleTypingParticipants() {
  return Object.values(remoteTypingState).filter(
    (entry) =>
      entry &&
      !entry.stopped &&
      entry.name !== myInfo.name &&
      entry.fileName === (activeFile ? activeFile.name : "") &&
      Date.now() - Number(entry.ts || 0) < 1800,
  );
}

function renderRemoteCursors() {
  if (!remoteCursorLayer) return;
  if (collabPermissions.quietMode) {
    remoteCursorLayer.innerHTML = "";
    return;
  }
  const wrapper = remoteCursorLayer.parentElement;
  if (!wrapper) return;

  const width = wrapper.clientWidth;
  const height = wrapper.clientHeight;
  const editor = document.getElementById("activeEditor");
  const typingHtml = editor
    ? getVisibleTypingParticipants()
        .map((entry) => {
          const caretPos = Math.max(0, Math.min(Number(entry.caretPos || 0), editor.value.length));
          const coords = getCaretCoordinates(editor, caretPos);
          const left = Math.max(0, coords.left);
          const top = Math.max(0, coords.top);
          const widthPx = Math.max(14, Math.min(90, Math.round((coords.lineHeight || 20) * 1.2)));
          const heightPx = Math.max(16, Math.round((coords.lineHeight || 20) * 0.9));
          return `<div class="remote-typing-highlight" style="left:${left}px;top:${top}px;width:${widthPx}px;height:${heightPx}px;--typing-color:${escapeHtml(entry.theme || "#4CAF50")};">
            <span class="remote-typing-label">${escapeHtml(entry.name || "User")} typing</span>
          </div>`;
        })
        .join("")
    : "";
  const cursorHtml = getVisibleCursorParticipants()
    .map((entry) => {
      const left = Math.max(0, Math.min(width - 2, Math.round((entry.x || 0) * width)));
      const top = Math.max(0, Math.min(height - 18, Math.round((entry.y || 0) * height)));
      return `<div class="remote-cursor" style="left:${left}px;top:${top}px;--cursor-color:${escapeHtml(entry.theme || "#4CAF50")};">
        <span class="remote-cursor-label">${escapeHtml(entry.name || "User")}</span>
      </div>`;
    })
    .join("");
  remoteCursorLayer.innerHTML = typingHtml + cursorHtml;
}

function pruneRemoteCursors() {
  let changed = false;
  const now = Date.now();
  Object.keys(remoteCursorState).forEach((key) => {
    if (now - Number(remoteCursorState[key]?.ts || 0) > 4000) {
      delete remoteCursorState[key];
      changed = true;
    }
  });
  Object.keys(remoteTypingState).forEach((key) => {
    if (now - Number(remoteTypingState[key]?.ts || 0) > 1800) {
      delete remoteTypingState[key];
      changed = true;
    }
  });
  if (changed) renderRemoteCursors();
}

function announceCursorPosition(event) {
  if (!collabSocket || !activeSessionId || !myInfo.name || !activeFile) return;
  const editor = document.getElementById("activeEditor");
  if (!editor) return;

  const rect = editor.getBoundingClientRect();
  if (!rect.width || !rect.height) return;
  const x = (event.clientX - rect.left) / rect.width;
  const y = (event.clientY - rect.top) / rect.height;
  if (x < 0 || x > 1 || y < 0 || y > 1) return;

  collabSocket.emit("collab:cursor", {
    sessionId: activeSessionId,
    cursor: {
      name: myInfo.name,
      theme: myInfo.theme,
      fileName: activeFile.name,
      x,
      y,
      ts: Date.now(),
    },
  });
}

function clearOwnSessionCursorBroadcast() {
  if (!collabSocket || !activeSessionId || !myInfo.name) return;
  collabSocket.emit("collab:cursor", {
    sessionId: activeSessionId,
    cursor: null,
  });
}

function setModalActions(html) {
  const actions = document.getElementById("modalActions");
  if (!actions) return;
  actions.innerHTML = html;
  actions.style.display = "flex";
  actions.style.gap = "10px";
  actions.style.alignItems = "center";
  actions.style.justifyContent =
    actions.children.length > 1 ? "space-between" : "center";

  if (actions.children.length > 1) {
    Array.from(actions.children).forEach((btn) => {
      btn.style.flex = "1";
    });
  }
}

function setCollabCloseButtonVisible(visible) {
  if (!closeModalBtn) return;
  closeModalBtn.style.display = visible ? "block" : "none";
}

function renderHostNameStep(prefill = "") {
  setCollabCloseButtonVisible(true);
  modalTitle.innerHTML = "<strong>START COLLAB</strong>";
  modalBody.innerHTML =
    `<p><strong>Your name:</strong></p><input type="text" id="userNameInput" placeholder="Name" style="width:80%;padding:8px;" maxlength="20" value="${escapeHtml(prefill)}">`;
  collabModal.style.display = "flex";
  errorMsgEl.style.display = "none";
  setModalActions(
    `<button id="modalDoneBtn" class="run-button"><strong>NEXT</strong></button>`,
  );

  const doneBtn = getModalDoneBtn();
  if (!doneBtn) return;
  doneBtn.onclick = () => {
    const name = document.getElementById("userNameInput").value.trim();
    const v = validateUsername(name);
    if (!v.valid) {
      errorMsgEl.textContent = v.error;
      errorMsgEl.style.display = "block";
      return;
    }
    errorMsgEl.style.display = "none";
    sessionData.host = name;
    promptForTheme(name);
  };
}

function renderJoinNameStep(sid, prefill = "") {
  collabHostName = "";
  setCollabCloseButtonVisible(false);
  modalTitle.innerHTML = "<strong>JOIN SESSION</strong>";
  modalBody.innerHTML =
    `<p><strong>Your name:</strong></p><input type="text" id="userNameInput" placeholder="Name" style="width:80%;padding:8px;" maxlength="20" value="${escapeHtml(prefill)}">`;
  collabModal.style.display = "flex";
  errorMsgEl.style.display = "none";
  setModalActions(
    `<button id="modalDoneBtn" class="run-button"><strong>NEXT</strong></button>`,
  );

  const doneBtn = getModalDoneBtn();
  if (!doneBtn) return;
  doneBtn.onclick = () => {
    const name = document.getElementById("userNameInput").value.trim();
    const v = validateUsername(name);
    if (!v.valid) {
      errorMsgEl.textContent = v.error;
      errorMsgEl.style.display = "block";
      return;
    }
    errorMsgEl.style.display = "none";
    promptJoinTheme(name, sid);
  };
}

function startCollaboration() {
  if (!ensureCollabSocket()) return;
  if (activeSessionId && myInfo.name) {
    showSessionDetails(activeSessionId);
    return;
  }
  renderHostNameStep();
}

const collabColorPalette = [
  "#4CAF50",
  "#2196F3",
  "#FF9800",
  "#E91E63",
  "#9C27B0",
  "#00BCD4",
  "#F44336",
  "#8BC34A",
  "#FFC107",
  "#3F51B5",
  "#009688",
  "#795548",
];

function normalizeThemeColor(value) {
  return String(value || "").trim().toLowerCase();
}

function buildCollabColorPickerHtml(selectedTheme, participants = []) {
  const selected = normalizeThemeColor(selectedTheme || collabColorPalette[0]);
  const takenMap = new Map();
  participants.forEach((participant) => {
    const theme = normalizeThemeColor(participant.theme);
    if (!theme) return;
    if (!takenMap.has(theme)) takenMap.set(theme, []);
    takenMap.get(theme).push(String(participant.name || "Participant"));
  });

  const swatches = collabColorPalette
    .map((color) => {
      const normalized = normalizeThemeColor(color);
      const takenNames = takenMap.get(normalized) || [];
      const isTaken = takenNames.length > 0;
      const title = isTaken
        ? `${color} taken by ${takenNames.join(", ")}`
        : `${color} available`;
      return `<button type="button" class="collab-color-swatch${selected === normalized ? " selected" : ""}${isTaken ? " taken" : ""}" data-color="${color}" title="${escapeHtml(title)}" style="background:${escapeHtml(color)};"></button>`;
    })
    .join("");

  const takenItems = Array.from(takenMap.entries())
    .map(
      ([color, names]) =>
        `<div class="collab-color-taken-item"><span class="collab-participant-color" style="width:14px;height:14px;flex-basis:14px;background:${escapeHtml(color)};"></span><span>${escapeHtml(names.join(", "))}</span></div>`,
    )
    .join("");

  return `
    <div class="collab-color-picker-wrap">
      <div>
        <p style="margin:0 0 10px;"><strong>Quick colors:</strong></p>
        <div class="collab-color-swatches">${swatches}</div>
      </div>
      <div>
        <p style="margin:0 0 8px;"><strong>Custom color:</strong></p>
        <input type="color" id="userThemeInput" value="${escapeHtml(selectedTheme || collabColorPalette[0])}">
      </div>
      <div>
        <p style="margin:0 0 8px;"><strong>Taken colors:</strong></p>
        <div class="collab-color-taken-list">${takenItems || "<div>No colors are taken yet.</div>"}</div>
      </div>
    </div>
  `;
}

function bindCollabColorPicker(selectedTheme) {
  const input = document.getElementById("userThemeInput");
  if (!input) return;

  const applySelectedSwatch = (colorValue) => {
    const normalized = normalizeThemeColor(colorValue);
    document.querySelectorAll(".collab-color-swatch").forEach((swatch) => {
      swatch.classList.toggle(
        "selected",
        normalizeThemeColor(swatch.getAttribute("data-color")) === normalized,
      );
    });
  };

  applySelectedSwatch(selectedTheme || input.value);

  input.addEventListener("input", () => {
    applySelectedSwatch(input.value);
  });

  document.querySelectorAll(".collab-color-swatch").forEach((swatch) => {
    swatch.addEventListener("click", () => {
      if (swatch.classList.contains("taken")) return;
      const color = swatch.getAttribute("data-color");
      if (!color) return;
      input.value = color;
      applySelectedSwatch(color);
    });
  });
}

function loadCollabPaletteParticipants(sessionId, callback) {
  if (!sessionId || !ensureCollabSocket()) {
    callback([]);
    return;
  }
  collabSocket.emit("collab:palette", { sessionId }, (res) => {
    if (!res || !res.ok) {
      callback([]);
      return;
    }
    callback(Array.isArray(res.participants) ? res.participants : []);
  });
}

function promptForTheme(hostName) {
  setCollabCloseButtonVisible(true);
  modalTitle.innerHTML = "<strong>PICK COLOR</strong>";
  modalBody.innerHTML = `
    <button
      id="modalBackBtn"
      aria-label="Go back"
      style="
        position: absolute;
        top: 10px;
        left: 12px;
        border: 1px solid var(--border-color);
        background: var(--bg-tertiary);
        color: var(--text-primary);
        border-radius: 8px;
        width: 34px;
        height: 30px;
        cursor: pointer;
        font-size: 18px;
        line-height: 1;
      "
    >&#8592;</button>
    <p style="margin-top: 8px;"><strong>Your color:</strong></p>
    ${buildCollabColorPickerHtml("#4CAF50", [])}
  `;
  errorMsgEl.style.display = "none";
  setModalActions(`<button id="modalDoneBtn" class="run-button"><strong>DONE</strong></button>`);
  bindCollabColorPicker("#4CAF50");

  const backBtn = document.getElementById("modalBackBtn");
  if (backBtn) {
    backBtn.onclick = () => renderHostNameStep(hostName || sessionData.host || "");
  }

  const doneBtn = getModalDoneBtn();
  if (!doneBtn) return;
  doneBtn.onclick = () => {
    sessionData.theme = document.getElementById("userThemeInput").value;
    createNumericSession();
  };
}

function createNumericSession() {
  if (!ensureCollabSocket()) return;
  resetTransientCollabUiState();

  collabSocket.emit(
    "collab:create",
    {
      name: sessionData.host,
      theme: sessionData.theme,
      files: projectFiles,
      activeFileName: activeFile ? activeFile.name : null,
      permissions: defaultCollabPermissions,
      baseUrl: window.location.origin,
    },
    (res) => {
      if (!res || !res.ok) {
        showNotification((res && res.error) || "Failed to create session", "error");
        return;
      }

      const sid = res.sessionId;
      const link = res.shareLink || `${window.location.origin}/frontend.html/${sid}`;
      activeSessionId = sid;
      collabShareLink = link;
      myInfo = { name: sessionData.host, theme: sessionData.theme };
      collabParticipants = res.participants || [myInfo];
      collabHostName = res.hostName || sessionData.host;
      collabPermissions = normalizeCollabPermissions(res.permissions);
      collabGroupMessages = [];
      collabPrivateMessages = [];
      collabChatMode = "group";
      collabChatTarget = "";
      window.history.replaceState({}, "", `/frontend.html/${sid}`);
      setCollabCloseButtonVisible(true);
      enforceCollabPermissionsUI();
      startSyncing();
      showSessionDetails(sid);
    },
  );
}

function showSessionDetails(sid) {
  collabModalView = "session";
  setCollabCloseButtonVisible(true);
  const link = collabShareLink || `${window.location.origin}/frontend.html/${sid}`;
  const orderedParticipants = [...collabParticipants].sort((a, b) => {
    if ((a.role || "") === "host") return -1;
    if ((b.role || "") === "host") return 1;
    if (Boolean(a.priority) !== Boolean(b.priority)) return a.priority ? -1 : 1;
    return String(a.name || "").localeCompare(String(b.name || ""));
  });
  const listItems = orderedParticipants
    .map((p) => {
      const roleLabel =
        p.role === "host" ? " (host)" : p.role === "co-host" ? " (co-host)" : "";
      const canManage = canModerateParticipant(p);
      const moreButton = canManage
        ? `<button class="run-button participant-more-btn" data-name="${escapeHtml(p.name)}" style="padding:4px 10px; font-size:11px;"><strong>MORE</strong></button>`
        : "";
      return `<div class="collab-participant-row">
        <div class="collab-participant-main">
          <span class="collab-participant-color" style="background:${escapeHtml(p.theme)};"></span>
          <div class="collab-participant-text">
            <div class="collab-participant-name">${escapeHtml(p.name)}${roleLabel}</div>
            <div class="collab-participant-meta">${escapeHtml(p.currentFile || "No active file")}${p.priority ? " · priority" : ""}</div>
          </div>
        </div>
        ${moreButton}
      </div>`;
    })
    .join("");

  modalTitle.innerHTML = "<strong>SESSION INFO</strong>";
  modalBody.innerHTML = `
    <div class="collab-section-card">
      <h4 class="collab-section-title">Session</h4>
      <div class="collab-meta-grid">
        <div class="collab-meta-item">
          <span class="collab-meta-label">Share Link</span>
          <span class="collab-meta-value">
            <input type="text" readonly id="collabLinkInput" value="${link}" style="width:100%;padding:8px;text-align:left;border-radius:8px;border:1px solid var(--border-color);background:var(--bg-primary);color:var(--text-primary);margin-bottom:10px;">
            <button id="sessionCopyLinkBtn" class="run-button" style="width:100%;justify-content:center;"><strong>COPY LINK</strong></button>
          </span>
        </div>
        <div class="collab-meta-item">
          <span class="collab-meta-label">Host</span>
          <span class="collab-meta-value">${escapeHtml(getCurrentHostName() || "Unknown")}</span>
        </div>
        <div class="collab-meta-item">
          <span class="collab-meta-label">Announcement</span>
          <span class="collab-meta-value">${escapeHtml(collabPermissions.announcementBar || "None")}</span>
        </div>
        <div class="collab-meta-item">
          <span class="collab-meta-label">Timer</span>
          <span class="collab-meta-value">${collabPermissions.sessionEndsAt ? escapeHtml(formatSessionTimeRemaining(collabPermissions.sessionEndsAt)) : "Off"}</span>
        </div>
      </div>
      <div class="collab-pill-row" style="margin-top:12px;">
        <span class="collab-pill">Pinned: ${escapeHtml(collabPermissions.pinnedFile || "None")}</span>
        <span class="collab-pill">Team focus: ${escapeHtml(collabPermissions.groupHighlightFile || "None")}</span>
      </div>
    </div>
    <div class="collab-section-card">
      <h4 class="collab-section-title">Participants</h4>
      <div class="collab-participant-list">${listItems}</div>
    </div>
    ${buildCollabChatPanelHtml()}
  `;

  document.getElementById("modalActions").innerHTML = `
    ${canUseCoHostTools() ? `<button id="groupControlsBtn" class="run-button"><strong>${isHost() ? "GROUP CONTROLS" : "TEAM TOOLS"}${isHost() && collabPendingJoins.length ? ` (${collabPendingJoins.length})` : ""}</strong></button>` : ""}
    <button class="run-button" onclick="closeModal()"><strong>CLOSE</strong></button>`;
  collabModal.style.display = "flex";

  const groupControlsBtn = document.getElementById("groupControlsBtn");
  if (groupControlsBtn) {
    groupControlsBtn.onclick = () => showGroupControls(sid);
  }
  const sessionCopyLinkBtn = document.getElementById("sessionCopyLinkBtn");
  if (sessionCopyLinkBtn) {
    sessionCopyLinkBtn.onclick = () => copyLink();
  }
  if (canUseCoHostTools()) {
    const moreButtons = modalBody.querySelectorAll(".participant-more-btn");
    moreButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        const targetName = btn.getAttribute("data-name") || "";
        showParticipantActions(targetName);
      });
    });
  }
  bindCollabChatControls();
  requestCollabChatHistory();
}

function copyLink() {
  const el = document.getElementById("collabLinkInput");
  if (!el) {
    showNotification("No collaboration link available to copy.", "error");
    return;
  }
  el.select();
  el.setSelectionRange(0, 99999);
  try {
    const copied = document.execCommand("copy");
    if (copied) {
      showNotification("Copied!", "success");
      return;
    }
    throw new Error("execCommand copy returned false");
  } catch {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard
        .writeText(el.value)
        .then(() => showNotification("Copied!", "success"))
        .catch(() => showNotification("Failed to copy link.", "error"));
    } else {
      showNotification("Failed to copy link.", "error");
    }
  }
}

function closeModal() {
  collabModalView = "idle";
  collabModal.style.display = "none";
  setCollabCloseButtonVisible(true);
  document.getElementById("modalActions").innerHTML =
    `<button id="modalDoneBtn" class="run-button"><strong>DONE</strong></button>`;
}

function isReloadNavigation() {
  try {
    const nav = performance.getEntriesByType("navigation");
    return Array.isArray(nav) && nav[0] && nav[0].type === "reload";
  } catch {
    return false;
  }
}

function resetCollabUrlToFreshState() {
  if (window.location.pathname.includes("/frontend.html/") || window.location.hash) {
    window.history.replaceState({}, "", "/frontend.html");
  }
}

function checkForSession() {
  const hash = extractSessionIdFromUrl();
  if (!hash) return;

  // On refresh, do not continue prior collaboration flow.
  if (isReloadNavigation()) {
    resetCollabUrlToFreshState();
    return;
  }

  if (!ensureCollabSocket()) return;
  renderJoinNameStep(hash);
}

function promptJoinTheme(name, sid) {
  setCollabCloseButtonVisible(false);
  modalTitle.innerHTML = "<strong>PICK COLOR</strong>";
  loadCollabPaletteParticipants(sid, (paletteParticipants) => {
    modalBody.innerHTML = `
      <button
        id="modalBackBtn"
        aria-label="Go back"
        style="
          position: absolute;
          top: 10px;
          left: 12px;
          border: 1px solid var(--border-color);
          background: var(--bg-tertiary);
          color: var(--text-primary);
          border-radius: 8px;
          width: 34px;
          height: 30px;
          cursor: pointer;
          font-size: 18px;
          line-height: 1;
        "
      >&#8592;</button>
      <p style="margin-top: 8px;"><strong>Your color:</strong></p>
      ${buildCollabColorPickerHtml("#2196F3", paletteParticipants)}
    `;
    errorMsgEl.style.display = "none";
    setModalActions(`<button id="modalDoneBtn" class="run-button"><strong>DONE</strong></button>`);
    bindCollabColorPicker("#2196F3");

    const backBtn = document.getElementById("modalBackBtn");
    if (backBtn) {
      backBtn.onclick = () => renderJoinNameStep(sid, name);
    }

    const doneBtn = getModalDoneBtn();
    if (!doneBtn) return;
    doneBtn.onclick = () => {
      const theme = document.getElementById("userThemeInput").value;
      resetTransientCollabUiState();

      collabSocket.emit(
        "collab:join",
        { sessionId: sid, name, theme },
        (res) => {
          if (!res || !res.ok) {
            if (res && res.pending) {
              myInfo = { name, theme };
              showJoinPendingState(sid, name);
              return;
            }
            if (res && String(res.error || "").toLowerCase().includes("session not found")) {
              window.location.href = "/404.html";
              return;
            }
            errorMsgEl.textContent = (res && res.error) || "Cannot join session.";
            errorMsgEl.style.display = "block";
            return;
          }

          activeSessionId = sid;
          myInfo = { name, theme };
          collabShareLink = `${window.location.origin}/frontend.html/${sid}`;
          collabParticipants = res.participants || [];
          collabHostName =
            (collabParticipants.find((p) => p.role === "host") || {}).name ||
            res.hostName ||
            "";
          collabPermissions = normalizeCollabPermissions(res.permissions);
          collabGroupMessages = [];
          collabPrivateMessages = [];
          collabChatMode = "group";
          collabChatTarget = "";
          applyRemoteSessionState(res.files, res.activeFileName, true);
          enforceCollabPermissionsUI();
          showNotification(`Welcome, ${name}!`, "success");
          startSyncing();
          closeModal();
        },
      );
    };
  });
}

function handleCodeChange() {
  if (isApplyingRemoteState) return;
  emitSessionUpdate();
}

function syncProjectWithSession() {
  if (isApplyingRemoteState) return;
  emitSessionUpdate();
}

function startSyncing() {
  emitSessionUpdate();
}
// PART 13 - MEDIA FILE HANDLER
const addMediaBtn = document.getElementById("addMediaBtn");
const mediaInput = document.createElement("input");
mediaInput.type = "file";
mediaInput.accept = "image/*,video/*,audio/*";
mediaInput.multiple = true;
mediaInput.style.display = "none";
document.body.appendChild(mediaInput);

addMediaBtn.addEventListener("click", () => {
  if (activeSessionId && isReadOnlyParticipant() && collabPermissions.disableNewFile) {
    showNotification("The host disabled creating new files for participants.", "error");
    return;
  }
  mediaInput.click();
});

mediaInput.addEventListener("change", (e) => {
  if (activeSessionId && isReadOnlyParticipant() && collabPermissions.disableNewFile) {
    showNotification("The host disabled creating new files for participants.", "error");
    mediaInput.value = "";
    return;
  }
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

      if (!projectFiles.some((f) => String(f.name || "").trim().toLowerCase() === name.toLowerCase())) {
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

// PART 14 - SEAMLESS & FULL-RANGE DIVIDER DRAG
let isDragging = false;
let dragAxis = "x";
let startPointerPos = 0;
let startEditorSize = 0;
let startPreviewSize = 0;
let containerSize = 0;

divider.addEventListener("mousedown", startDragging);
divider.addEventListener("touchstart", startDragging, { passive: true });
divider.addEventListener("dblclick", resetEditorPreviewSplit);

function isStackedEditorLayout() {
  return window.getComputedStyle(editorContainer).flexDirection === "column";
}

function resetEditorPreviewSplit() {
  if (isStackedEditorLayout()) {
    editorsPanel.style.width = "100%";
    editorsPanel.style.height = "52dvh";
    editorsPanel.style.flex = "none";
    if (previewPanel) {
      previewPanel.style.width = "100%";
      previewPanel.style.height = "48dvh";
      previewPanel.style.flex = "none";
    }
    return;
  }

  editorsPanel.style.width = "50%";
  editorsPanel.style.height = "";
  editorsPanel.style.flex = "none";
  if (previewPanel) {
    previewPanel.style.width = "";
    previewPanel.style.height = "";
    previewPanel.style.flex = "1";
  }
}

function startDragging(e) {
  isDragging = true;
  divider.classList.add("dragging");
  dragAxis = isStackedEditorLayout() ? "y" : "x";
  document.body.style.cursor = dragAxis === "y" ? "row-resize" : "col-resize";
  document.body.style.userSelect = "none";

  startPointerPos = e.type.includes("mouse")
    ? dragAxis === "y"
      ? e.pageY
      : e.pageX
    : dragAxis === "y"
      ? e.touches[0].pageY
      : e.touches[0].pageX;
  startEditorSize = dragAxis === "y"
    ? editorsPanel.getBoundingClientRect().height
    : editorsPanel.getBoundingClientRect().width;
  startPreviewSize = dragAxis === "y" && previewPanel
    ? previewPanel.getBoundingClientRect().height
    : 0;
  containerSize = dragAxis === "y"
    ? editorContainer.getBoundingClientRect().height
    : editorContainer.getBoundingClientRect().width;

  e.preventDefault();

  document.addEventListener("mousemove", doDrag);
  document.addEventListener("touchmove", doDrag, { passive: false });
  document.addEventListener("mouseup", stopDragging);
  document.addEventListener("touchend", stopDragging);
}

function doDrag(e) {
  if (!isDragging) return;

  const currentPointerPos = e.type.includes("mouse")
    ? dragAxis === "y"
      ? e.pageY
      : e.pageX
    : dragAxis === "y"
      ? e.touches[0].pageY
      : e.touches[0].pageX;
  const diff = currentPointerPos - startPointerPos;

  if (dragAxis === "y") {
    const minHeight = 260;
    const dividerSize = divider.getBoundingClientRect().height || 6;
    const maxHeight = Math.max(minHeight, containerSize - dividerSize - 220);
    const newEditorHeight = Math.max(minHeight, Math.min(startEditorSize + diff, maxHeight));
    const newPreviewHeight = Math.max(220, containerSize - dividerSize - newEditorHeight);

    editorsPanel.style.height = `${newEditorHeight}px`;
    editorsPanel.style.width = "100%";
    editorsPanel.style.flex = "none";
    if (previewPanel) {
      previewPanel.style.height = `${newPreviewHeight}px`;
      previewPanel.style.flex = "none";
      previewPanel.style.width = "100%";
    }
  } else {
    const minWidth = 200;
    const dividerSize = divider.getBoundingClientRect().width || 8;
    const maxWidth = Math.max(minWidth, containerSize - dividerSize - 100);
    const newWidth = Math.max(minWidth, Math.min(startEditorSize + diff, maxWidth));

    editorsPanel.style.width = `${newWidth}px`;
    editorsPanel.style.height = "";
    editorsPanel.style.flex = "none";
    if (previewPanel) {
      previewPanel.style.height = "";
      previewPanel.style.width = "";
      previewPanel.style.flex = "1";
    }
  }

  if (e.type === "touchmove") e.preventDefault();
}

function stopDragging() {
  if (!isDragging) return;
  isDragging = false;
  divider.classList.remove("dragging");
  document.body.style.cursor = "";
  document.body.style.userSelect = "";

  document.removeEventListener("mousemove", doDrag);
  document.removeEventListener("touchmove", doDrag);
  document.removeEventListener("mouseup", stopDragging);
  document.removeEventListener("touchend", stopDragging);
}

// Reset on window resize
window.addEventListener("resize", () => {
  if (!isDragging) {
    if (isStackedEditorLayout()) {
      editorsPanel.style.width = "100%";
      if (!editorsPanel.style.height) {
        editorsPanel.style.height = "52dvh";
      }
      if (previewPanel) {
        previewPanel.style.width = "100%";
        if (!previewPanel.style.height) {
          previewPanel.style.height = "48dvh";
        }
        previewPanel.style.flex = "none";
      }
    } else {
      const current = editorsPanel.getBoundingClientRect().width;
      const max = window.innerWidth * 0.8;
      if (current > max || editorsPanel.style.width === "100%") {
        editorsPanel.style.width = "50%";
      }
      editorsPanel.style.height = "";
      if (previewPanel) {
        previewPanel.style.height = "";
        previewPanel.style.width = "";
        previewPanel.style.flex = "1";
      }
    }
  }
});

// PART 15 - APPLICATION INITIALIZATION
window.addEventListener("load", () => {
  loadSettings();
  renderFileList();
  initializeEditor();
  tryRestoreAutosaveDraft();
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
if (saveProjectBtn) {
  saveProjectBtn.addEventListener("click", async () => {
    const dialog = await showAppPrompt(
      "SAVE PROJECT",
      "Choose a name for this saved project:",
      getSuggestedProjectName(),
      "codx-project",
    );
    if (!dialog?.ok) return;
    saveCurrentProjectToLibrary(dialog.value);
  });
}
if (openSavedProjectsBtn) {
  openSavedProjectsBtn.addEventListener("click", () => renderProjectLibrary("saved"));
}
if (templatesBtn) {
  templatesBtn.addEventListener("click", () => renderProjectLibrary("templates"));
}
if (publishProjectBtn) {
  publishProjectBtn.addEventListener("click", publishCurrentProject);
}
if (closeProjectLibraryBtn) {
  closeProjectLibraryBtn.addEventListener("click", closeProjectLibrary);
}
if (projectLibraryModal) {
  projectLibraryModal.addEventListener("click", (event) => {
    if (event.target === projectLibraryModal) {
      closeProjectLibrary();
    }
  });
}

// PART 16 - FONT PICKER
const fontPickerBtn = document.getElementById("fontPickerBtn");
const fontPickerModal = document.getElementById("fontPickerModal");
const closeFontPickerBtn = document.getElementById("closeFontPickerBtn");
const fontGrid = document.getElementById("fontGrid");
const fontSearchInput = document.getElementById("fontSearchInput");

const fonts = [
  { name: "Arial", family: "Arial, sans-serif", keywords: "clean ui sans" },
  { name: "Verdana", family: "Verdana, sans-serif", keywords: "wide readable sans" },
  { name: "Trebuchet MS", family: "'Trebuchet MS', sans-serif", keywords: "modern humanist sans" },
  { name: "Tahoma", family: "Tahoma, sans-serif", keywords: "compact ui sans" },
  { name: "Century Gothic", family: "'Century Gothic', sans-serif", keywords: "geometric round sans" },
  { name: "Franklin Gothic", family: "'Franklin Gothic Medium', sans-serif", keywords: "bold editorial sans" },
  { name: "Times New Roman", family: "'Times New Roman', serif", keywords: "classic newspaper serif" },
  { name: "Georgia", family: "Georgia, serif", keywords: "screen serif readable" },
  { name: "Garamond", family: "Garamond, serif", keywords: "elegant book serif" },
  { name: "Palatino", family: "'Palatino Linotype', serif", keywords: "calligraphic old style serif" },
  { name: "Cambria", family: "Cambria, serif", keywords: "modern serif body text" },
  { name: "Courier New", family: "'Courier New', monospace", keywords: "typewriter mono code" },
  { name: "Consolas", family: "Consolas, monospace", keywords: "programming mono clear" },
  { name: "Lucida Console", family: "'Lucida Console', monospace", keywords: "terminal monospace" },
  { name: "Impact", family: "Impact, fantasy", keywords: "heavy headline display" },
  { name: "Copperplate", family: "'Copperplate', fantasy", keywords: "engraved roman display" },
  { name: "Comic Sans MS", family: "'Comic Sans MS', cursive", keywords: "casual playful handwritten" },
  { name: "Brush Script MT", family: "'Brush Script MT', cursive", keywords: "script brush calligraphy" },
  { name: "Papyrus", family: "'Papyrus', fantasy", keywords: "rough textured display" },
  { name: "Candara", family: "Candara, sans-serif", keywords: "soft contemporary sans" },
  { name: "Gill Sans", family: "'Gill Sans', 'Gill Sans MT', sans-serif", keywords: "humanist british sans" },
  { name: "Optima", family: "Optima, 'Segoe UI', sans-serif", keywords: "flared elegant sans" },
  { name: "Futura", family: "Futura, 'Century Gothic', sans-serif", keywords: "geometric bauhaus sans" },
  { name: "Avenir", family: "Avenir, 'Trebuchet MS', sans-serif", keywords: "modern geometric sans" },
  { name: "Rockwell", family: "Rockwell, 'Courier New', serif", keywords: "slab serif sturdy" },
  { name: "Bodoni MT", family: "'Bodoni MT', 'Times New Roman', serif", keywords: "high contrast fashion serif" },
  { name: "Didot", family: "Didot, 'Times New Roman', serif", keywords: "luxury editorial serif" },
  { name: "Perpetua", family: "Perpetua, Georgia, serif", keywords: "book classical serif" },
  { name: "Book Antiqua", family: "'Book Antiqua', Palatino, serif", keywords: "old style serif" },
  { name: "Lucida Bright", family: "'Lucida Bright', Georgia, serif", keywords: "formal serif" },
  { name: "American Typewriter", family: "'American Typewriter', 'Courier New', monospace", keywords: "retro typewriter mono" },
  { name: "OCR A", family: "'OCR A Std', 'Lucida Console', monospace", keywords: "machine readable mono" },
  { name: "Andale Mono", family: "'Andale Mono', Consolas, monospace", keywords: "clean coding mono" },
  { name: "Bradley Hand", family: "'Bradley Hand', 'Comic Sans MS', cursive", keywords: "casual handwriting script" },
  { name: "Snell Roundhand", family: "'Snell Roundhand', 'Brush Script MT', cursive", keywords: "formal script calligraphy" },
  { name: "Chalkduster", family: "Chalkduster, fantasy", keywords: "chalk classroom display" },
  { name: "Stencil", family: "Stencil, Impact, fantasy", keywords: "military cutout display" },
  { name: "Cooper Black", family: "'Cooper Black', Impact, serif", keywords: "rounded heavy retro display" },
  { name: "Segoe Print", family: "'Segoe Print', 'Comic Sans MS', cursive", keywords: "friendly handwritten" },
  { name: "Segoe Script", family: "'Segoe Script', 'Brush Script MT', cursive", keywords: "flowing script handwriting" },
  { name: "Avant Garde", family: "'Avant Garde', Futura, sans-serif", keywords: "futurist geometric display sans" },
  { name: "Baskerville", family: "Baskerville, Georgia, serif", keywords: "literary refined serif" },
  { name: "Big Caslon", family: "'Big Caslon', 'Times New Roman', serif", keywords: "classical dramatic serif" },
  { name: "Monaco", family: "Monaco, 'Lucida Console', monospace", keywords: "compact terminal mono" },
  { name: "Menlo", family: "Menlo, Consolas, monospace", keywords: "developer coding mono" },
  { name: "Geneva", family: "Geneva, Tahoma, sans-serif", keywords: "neat swiss sans" },
  { name: "Hoefler Text", family: "'Hoefler Text', Garamond, serif", keywords: "editorial elegant serif" },
  { name: "Marker Felt", family: "'Marker Felt', 'Comic Sans MS', cursive", keywords: "marker playful handwritten" },
  { name: "Noteworthy", family: "Noteworthy, 'Segoe Print', cursive", keywords: "notebook handdrawn notes" },
  { name: "DIN", family: "DIN, 'Franklin Gothic Medium', sans-serif", keywords: "industrial signage sans" },
  { name: "Eurostile", family: "Eurostile, 'Century Gothic', sans-serif", keywords: "tech square futuristic sans" },
  { name: "Univers", family: "Univers, Arial, sans-serif", keywords: "neutral swiss sans" },
  { name: "Frutiger", family: "Frutiger, Arial, sans-serif", keywords: "wayfinding humanist sans" },
  { name: "Albertus", family: "Albertus, Palatino, serif", keywords: "inscription carved serif" },
  { name: "Trajan", family: "Trajan, 'Times New Roman', serif", keywords: "cinematic roman capitals" },
  { name: "Aptos", family: "Aptos, Calibri, sans-serif", keywords: "modern office sans" },
  { name: "Calisto MT", family: "'Calisto MT', Georgia, serif", keywords: "bookish readable serif" },
  { name: "Bell MT", family: "'Bell MT', Baskerville, serif", keywords: "traditional formal serif" },
  { name: "Kristen ITC", family: "'Kristen ITC', 'Comic Sans MS', cursive", keywords: "quirky playful handwritten" },
  { name: "Rage Italic", family: "'Rage Italic', 'Brush Script MT', cursive", keywords: "dramatic flourish script" },
  { name: "Bookman", family: "Bookman, Georgia, serif", keywords: "friendly oldstyle serif" },
  { name: "Wide Latin", family: "'Wide Latin', Impact, fantasy", keywords: "western poster display" },
  { name: "Berlin Sans FB", family: "'Berlin Sans FB', 'Trebuchet MS', sans-serif", keywords: "rounded art deco sans" },
  { name: "MS Gothic", family: "'MS Gothic', monospace", keywords: "pixel japanese mono" },
];

function renderFonts(query = "") {
  const term = query.trim().toLowerCase();
  const filteredFonts = fonts.filter((font) => {
    const haystack = `${font.name} ${font.family} ${font.keywords || ""}`.toLowerCase();
    return !term || haystack.includes(term);
  });

  fontGrid.innerHTML = "";
  if (filteredFonts.length === 0) {
    fontGrid.innerHTML =
      '<div class="font-card" style="grid-column: 1 / -1; cursor: default;"><div class="font-name">No Results</div><div class="font-preview" style="font-size:16px;">Try a different keyword.</div></div>';
    return;
  }

  filteredFonts.forEach((font) => {
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
    const copied = document.execCommand("copy");
    if (copied) {
      showNotification(`Copied: ${fontName}`, "success");
    } else {
      showNotification("Failed to copy", "error");
    }
  } catch (err) {
    showNotification("Failed to copy", "error");
  }
  document.body.removeChild(textarea);
}

fontPickerBtn.addEventListener("click", () => {
  renderFonts();
  if (fontSearchInput) {
    fontSearchInput.value = "";
    fontSearchInput.focus();
  }
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

if (fontSearchInput) {
  fontSearchInput.addEventListener("input", (e) => {
    renderFonts(e.target.value || "");
  });
}

// PART 17 - TUTORIAL SYSTEM

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
      "Work together with others in real time. Sessions include chat, participant roles, room controls, and live cursors.",
    position: "bottom-left",
  },
  {
    target: "#previewFullscreenBtn",
    icon: "fa-solid fa-expand",
    title: "Fullscreen Preview",
    description:
      "View your website in fullscreen mode. Useful for checking layouts and responsive behavior.",
    position: "bottom-left",
  },
  {
    target: "#settingsBtn",
    icon: "fa-solid fa-gear",
    title: "Editor Settings",
    description:
      "Customize editor colors, text size, and fonts. You can also paste a Google Fonts embed link for the editor text style.",
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
      "Browse and copy font-family CSS code. The picker includes more distinctive fonts and a search box.",
    position: "bottom-left",
  },
  {
    target: "#zenModeBtn",
    icon: "fa-solid fa-laptop-code",
    title: "Zen Mode",
    description:
      "Hide the surrounding interface and focus only on typing. You can leave Zen Mode with the EXIT ZEN button or Esc.",
    position: "bottom-left",
  },
  {
    target: "#newFileBtn",
    icon: "fa-solid fa-plus",
    title: "New File",
    description: "Create new HTML, CSS, JS, or .env files for your project.",
    position: "bottom-right",
  },
  {
    target: "#fileList",
    icon: "fa-solid fa-folder-open",
    title: "File Explorer",
    description:
      "Switch between project files here. You can rename files, delete them, and track file-level errors.",
    position: "bottom",
  },
  {
    target: "#activeEditor",
    icon: "fa-solid fa-code",
    title: "Code Editor",
    description:
      "Write your code here. Features include auto-closing tags and brackets, HTML/CSS/JS suggestions, inline style suggestions, syntax highlighting in style/script blocks, 3-space tab indentation, and error highlighting.",
    position: "right",
  },
  {
    target: "#runPreviewBtn",
    icon: "fa-solid fa-play",
    title: "Run Button",
    description: "Click to manually run your code and update the preview.",
    position: "top-left",
  },
  {
    target: "#saveProjectBtn",
    icon: "fa-solid fa-floppy-disk",
    title: "Save Project",
    description:
      "Save the current project in your browser. Using the same project name again updates the saved version, and autosave also keeps your latest local work recoverable.",
    position: "top-left",
  },
  {
    target: "#openSavedProjectsBtn",
    icon: "fa-solid fa-folder-open",
    title: "Open Saved",
    description:
      "Open your saved project library, restore earlier work, or delete saved projects with confirmation.",
    position: "top-left",
  },
  {
    target: "#templatesBtn",
    icon: "fa-solid fa-layer-group",
    title: "Starter Templates",
    description:
      "Load built-in starter templates from the template library, including ready-made layouts like landing page, portfolio, and contact form setups.",
    position: "top-left",
  },
  {
    target: "#publishProjectBtn",
    icon: "fa-solid fa-share-nodes",
    title: "Publish / Share",
    description:
      "Publish the current project and generate a shareable link for the rendered result.",
    position: "top-left",
  },
  {
    target: 'button[onclick="exportAsZip()"]',
    icon: "fa-solid fa-file-zipper",
    title: "Export ZIP File",
    description:
      "Download your current project as a ZIP file so you can back it up or share it.",
    position: "top-left",
  },
  {
    target: 'button[onclick="importZip()"]',
    icon: "fa-solid fa-file-import",
    title: "Import ZIP File",
    description:
      "Load an existing ZIP project into the editor. It restores your HTML, CSS, and JS files.",
    position: "top-left",
  },
  {
    target: "#output",
    icon: "fa-solid fa-eye",
    title: "Live Preview",
    description:
      "See your website come to life here. The preview can follow linked project pages and shows the current HTML title in its header.",
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

// Insert tutorial modal into body only if it does not already exist in HTML
if (!document.getElementById("tutorialModal")) {
  document.body.insertAdjacentHTML("beforeend", tutorialModalHTML);
}

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

closeTutorialBtn.addEventListener("click", async () => {
  const dialog = await showAppConfirm(
    "SKIP TUTORIAL",
    "Are you sure you want to skip the tutorial? You can always restart it from the settings.",
    "SKIP",
    "CANCEL",
    "background:#d32f2f;",
  );
  if (dialog?.ok) {
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
    'div[style*="display: flex"][style*="justify-content: space-between"]',
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
console.log("Ctrl/Cmd + S: Exports the project as a ZIP.");
console.log("Ctrl/Cmd + Enter: Manually triggers an update of the preview pane.");
console.log("Ctrl/Cmd + Q: Creates a new file in the project.");
console.log("Ctrl/Cmd + Shift + C: Opens the console panel.");
console.log("Ctrl/Cmd + C, then X: Opens hidden developer tools.");
console.log("CodX Editor loaded with file linking and tag suggestions!");


