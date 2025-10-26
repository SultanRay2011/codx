const tabs = document.querySelectorAll('.tab');
const editors = document.querySelectorAll('textarea');
const iframe = document.getElementById('output');
const autoRunCheckbox = document.getElementById('autoRun');
const showConsoleCheckbox = document.getElementById('showConsole');
const themeToggle = document.getElementById('themeToggle');
const consoleContainer = document.querySelector('.console-container');
const consoleOutput = document.getElementById('consoleOutput');
const divider = document.querySelector('.divider');
const editorsPanel = document.querySelector('.editors');
const lineNumbers = document.getElementById('lineNumbers');
const editorContainer = document.querySelector('.editor-container');
const settingsBtn = document.getElementById('settingsBtn');
const settingsModal = document.getElementById('settingsModal');
const closeSettingsBtn = document.getElementById('closeSettingsBtn');
const applySettingsBtn = document.getElementById('applySettings');
const resetSettingsBtn = document.getElementById('resetSettings');

const editorBgColorInput = document.getElementById('editorBgColor');
const editorBgColorText = document.getElementById('editorBgColorText');
const editorTextColorInput = document.getElementById('editorTextColor');
const editorTextColorText = document.getElementById('editorTextColorText');
const editorTextSizeInput = document.getElementById('editorTextSize');
const textSizeValue = document.getElementById('textSizeValue');
const editorFontFamilySelect = document.getElementById('editorFontFamily');
const settingsPreview = document.getElementById('settingsPreview');
let hasUnsavedChanges = false; // Flag to track changes

// Default settings
const defaultSettings = {
  bgColor: '#1E1E1E',
  textColor: '#ffffff',
  textSize: '14',
  fontFamily: 'monospace'
};

// Load saved settings or use defaults
function loadSettings() {
  const savedSettings = localStorage.getItem('editorSettings');
  if (savedSettings) {
    const settings = JSON.parse(savedSettings);
    editorBgColorInput.value = settings.bgColor;
    editorBgColorText.value = settings.bgColor;
    editorTextColorInput.value = settings.textColor;
    editorTextColorText.value = settings.textColor;
    editorTextSizeInput.value = settings.textSize;
    textSizeValue.textContent = settings.textSize + 'px';
    editorFontFamilySelect.value = settings.fontFamily;
  } else {
    editorBgColorInput.value = defaultSettings.bgColor;
    editorBgColorText.value = defaultSettings.bgColor;
    editorTextColorInput.value = defaultSettings.textColor;
    editorTextColorText.value = defaultSettings.textColor;
    editorTextSizeInput.value = defaultSettings.textSize;
    textSizeValue.textContent = defaultSettings.textSize + 'px';
    editorFontFamilySelect.value = defaultSettings.fontFamily;
  }
  updatePreviewBox();
  applySettingsToEditors();
}

// Update preview box
function updatePreviewBox() {
  settingsPreview.style.backgroundColor = editorBgColorInput.value;
  settingsPreview.style.color = editorTextColorInput.value;
  settingsPreview.style.fontSize = editorTextSizeInput.value + 'px';
  settingsPreview.style.fontFamily = editorFontFamilySelect.value;
}

// Apply settings to all editors
function applySettingsToEditors() {
  editors.forEach(editor => {
    editor.style.backgroundColor = editorBgColorInput.value;
    editor.style.color = editorTextColorInput.value;
    editor.style.fontSize = editorTextSizeInput.value + 'px';
    editor.style.fontFamily = editorFontFamilySelect.value;
  });
  
  // Also update line numbers
  lineNumbers.style.fontSize = editorTextSizeInput.value + 'px';
}

// Event listeners for real-time preview
editorBgColorInput.addEventListener('input', (e) => {
  editorBgColorText.value = e.target.value;
  updatePreviewBox();
});

editorTextColorInput.addEventListener('input', (e) => {
  editorTextColorText.value = e.target.value;
  updatePreviewBox();
});

editorTextSizeInput.addEventListener('input', (e) => {
  textSizeValue.textContent = e.target.value + 'px';
  updatePreviewBox();
});

editorFontFamilySelect.addEventListener('change', updatePreviewBox);

// Open settings modal
settingsBtn.addEventListener('click', () => {
  loadSettings();
  settingsModal.style.display = 'flex';
});

// Close settings modal
closeSettingsBtn.addEventListener('click', () => {
  settingsModal.style.display = 'none';
});

// Close modal when clicking outside
settingsModal.addEventListener('click', (e) => {
  if (e.target === settingsModal) {
    settingsModal.style.display = 'none';
  }
});

// Apply settings
applySettingsBtn.addEventListener('click', () => {
  const settings = {
    bgColor: editorBgColorInput.value,
    textColor: editorTextColorInput.value,
    textSize: editorTextSizeInput.value,
    fontFamily: editorFontFamilySelect.value
  };
  
  localStorage.setItem('editorSettings', JSON.stringify(settings));
  applySettingsToEditors();
  alert('Settings applied successfully!');
  settingsModal.style.display = 'none';
});

// Reset settings to default
resetSettingsBtn.addEventListener('click', () => {
  if (confirm('Are you sure you want to reset all settings to default?')) {
    localStorage.removeItem('editorSettings');
    editorBgColorInput.value = defaultSettings.bgColor;
    editorBgColorText.value = defaultSettings.bgColor;
    editorTextColorInput.value = defaultSettings.textColor;
    editorTextColorText.value = defaultSettings.textColor;
    editorTextSizeInput.value = defaultSettings.textSize;
    textSizeValue.textContent = defaultSettings.textSize + 'px';
    editorFontFamilySelect.value = defaultSettings.fontFamily;
    updatePreviewBox();
    applySettingsToEditors();
    alert('Settings reset to default!');
  }
});

// Load settings on page load
window.addEventListener('load', () => {
  loadSettings();
});

// Theme toggle functionality
themeToggle.addEventListener('change', () => {
  document.body.classList.toggle('light', themeToggle.checked);
  localStorage.setItem('theme', themeToggle.checked ? 'light' : 'dark');
});

// Load saved theme preference
const savedTheme = localStorage.getItem('theme');
if (savedTheme === 'light') {
  themeToggle.checked = true;
  document.body.classList.add('light');
}

// Tab switching
tabs.forEach(tab => {
  tab.addEventListener('click', () => {
    tabs.forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    editors.forEach(editor => editor.classList.remove('active'));
    const activeEditor = document.getElementById(tab.dataset.tab + 'Code');
    activeEditor.classList.add('active');
    updateLineNumbers(activeEditor);
    syncScroll(activeEditor);
  });
});

// Toggle console
showConsoleCheckbox.addEventListener('change', () => {
  consoleContainer.classList.toggle('show', showConsoleCheckbox.checked);
});

// Update preview with console capture
function updatePreview() {
  const html = document.getElementById('htmlCode').value;
  const css = `<style>${document.getElementById('cssCode').value}</style>`;
  const js = document.getElementById('jsCode').value;
  
  consoleOutput.innerHTML = ''; // Clear console on each run
  
  let jsWithConsole = '';
if (js.trim()) {
  jsWithConsole = `<script>
    const parentConsole = parent.document.getElementById('consoleOutput');
    function appendMessage(type, prefix, args) {
      const line = document.createElement('div');
      line.className = 'console-' + type;
      line.textContent = prefix + args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
      ).join(' ');
      parentConsole.appendChild(line);

      // ✅ Auto-scroll to bottom
      parentConsole.scrollTop = parentConsole.scrollHeight;
    }
    console.log = (...args) => { appendMessage('log', '> ', args); };
    console.warn = (...args) => { appendMessage('warn', '⚠️ WARNING: ', args); };
    console.error = (...args) => { appendMessage('error', '❌ ERROR: ', args); };
    window.onerror = (msg, src, line) => { appendMessage('error', '❌ Uncaught: ', [msg + ' (line ' + line + ')']); return false; };
    window.addEventListener('unhandledrejection', e => appendMessage('error', '❌ Promise: ', [e.reason]));
    try { ${js} } catch(e) { appendMessage('error', '❌ Script Error: ', [e.message]); }
  <\/script>`;
}


  
  iframe.srcdoc = html + css + jsWithConsole;
}

// Line numbers function
function updateLineNumbers(textarea = document.querySelector('textarea.active')) {
  if (!textarea) return;
  const lines = textarea.value.split('\n').length;
  lineNumbers.textContent = Array.from({ length: lines }, (_, i) => i + 1).join('\n');
}

// Sync scrolling between textarea and line numbers
function syncScroll(textarea) {
  if (!textarea) return;
  textarea.addEventListener('scroll', () => { lineNumbers.scrollTop = textarea.scrollTop; });
}

// Initialize editors
editors.forEach(editor => {
  updateLineNumbers(editor);
  syncScroll(editor);
  editor.addEventListener('input', () => {
    hasUnsavedChanges = true; // Set flag on input
    updateLineNumbers(editor);
    if (autoRunCheckbox.checked) updatePreview();
  });
  editor.addEventListener('keydown', function(e) {
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = this.selectionStart, end = this.selectionEnd;
      this.value = this.value.substring(0, start) + "  " + this.value.substring(end);
      this.selectionStart = this.selectionEnd = start + 2;
      if (autoRunCheckbox.checked) updatePreview();
    }
  });
});

// Drag & Drop support
['dragover', 'dragleave', 'drop'].forEach(eventName => {
    editorContainer.addEventListener(eventName, e => {
        e.preventDefault();
        e.stopPropagation();
        if (eventName === 'dragover') editorContainer.classList.add('dragover');
        if (eventName === 'dragleave' || eventName === 'drop') editorContainer.classList.remove('dragover');
    });
});
editorContainer.addEventListener('drop', e => {
    for (const file of e.dataTransfer.files) {
        const reader = new FileReader();
        reader.onload = ev => {
            const content = ev.target.result;
            const ext = file.name.split('.').pop();
            const targetId = {html: 'htmlCode', css: 'cssCode', js: 'jsCode'}[ext];
            if (targetId) {
                const editor = document.getElementById(targetId);
                editor.value = content;
                hasUnsavedChanges = true; // Set flag on drop
                updateLineNumbers(editor);
                if (autoRunCheckbox.checked) updatePreview();
            }
        };
        reader.readAsText(file);
    }
});

// Initialize preview
updatePreview();

// Resizable panels
let isResizing = false;
divider.addEventListener('mousedown', () => { isResizing = true; });
document.addEventListener('mousemove', e => {
  if (!isResizing) return;
  const isMobile = window.innerWidth <= 768;
  document.body.style.cursor = isMobile ? 'row-resize' : 'col-resize';
  const newSize = isMobile ? e.clientY : e.clientX;
  const maxSize = isMobile ? window.innerHeight : window.innerWidth;
  if (newSize > 100 && newSize < maxSize - 100) {
    editorsPanel.style[isMobile ? 'height' : 'width'] = newSize + 'px';
  }
});
document.addEventListener('mouseup', () => { 
  isResizing = false; 
  document.body.style.cursor = 'default';
});

// ZIP functionality
function exportAsZip() {
  hasUnsavedChanges = false; // Assume exporting is a form of saving
  const zip = new JSZip();
  zip.file("index.html", document.getElementById('htmlCode').value);
  zip.file("style.css", document.getElementById('cssCode').value);
  zip.file("script.js", document.getElementById('jsCode').value);
  zip.generateAsync({ type: "blob" }).then(content => {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(content);
    a.download = "code.zip";
    a.click();
  });
}

function importZip() { document.getElementById('zipFileInput').click(); }

function handleZipImport(event) {
  const file = event.target.files[0];
  if (!file) return;
  JSZip.loadAsync(file).then(zip => {
    ['html', 'css', 'js'].forEach(lang => document.getElementById(lang + 'Code').value = '');
    const promises = [];
    zip.forEach((path, entry) => {
        const ext = path.split('.').pop();
        const targetId = {html: 'htmlCode', css: 'cssCode', js: 'jsCode'}[ext];
        if (targetId && !entry.dir) {
            promises.push(entry.async("string").then(content => {
                document.getElementById(targetId).value = content;
            }));
        }
    });
    Promise.all(promises).then(() => {
        hasUnsavedChanges = true; // Set flag after importing
        updateLineNumbers();
        if (autoRunCheckbox.checked) updatePreview();
        alert('ZIP project imported successfully!');
    });
  }).catch(err => alert('Error reading ZIP file.'));
  event.target.value = '';
}

// Fullscreen for the whole page
const fullscreenBtn = document.getElementById('fullscreenBtn');
fullscreenBtn.addEventListener('click', () => {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen();
    fullscreenBtn.innerHTML = "<strong>⤢ EXIT FULLSCREEN</strong>";
  } else {
    document.exitFullscreen();
    fullscreenBtn.innerHTML = "<strong>⛶ FULLSCREEN MODE</strong>";
  }
});

updateLineNumbers();


// ===============================================
// ========= CONFIRM ON CLOSE IF UNSAVED =========
// ===============================================
window.addEventListener('beforeunload', function (e) {
    if (hasUnsavedChanges) {
        // Cancel the event
        e.preventDefault();
        // Chrome requires returnValue to be set
        e.returnValue = '';
        // Most browsers will show a generic message, but returning one is good practice
        return 'Are you sure you want to leave? Your changes may not be saved.';
    }
});


// =======================================================
// ========= COLLABORATION & PREVIEW FULLSCREEN CODE =====
// =======================================================

// --- Element Selectors ---
const collabBtn = document.getElementById('collabBtn');
const collabModal = document.getElementById('collabModal');
const modalTitle = document.getElementById('modalTitle');
const modalBody = document.getElementById('modalBody');
const modalDoneBtn = document.getElementById('modalDoneBtn');
const closeModalBtn = document.getElementById('closeModalBtn');
const typingIndicatorEl = document.getElementById('typingIndicator');
const previewFullscreenBtn = document.getElementById('previewFullscreenBtn');
const previewIframe = document.getElementById('output');
const errorMsgEl = document.getElementById('errorMsg');

// --- Global Variables ---
let sessionData = {};
let typingTimer;
let myInfo = {}; 

// --- Event Listeners ---
closeModalBtn.addEventListener('click', closeModal);
collabBtn.addEventListener('click', startCollaboration);
window.addEventListener('load', checkForSession);
window.addEventListener('storage', handleStorageChange);
previewFullscreenBtn.addEventListener('click', togglePreviewFullscreen);
document.addEventListener('fullscreenchange', updateFullscreenButtonState);


// --- Typing Indicator Functions ---
function announceTyping(activeEditorId) {
    if (!myInfo.name) return;
    clearTimeout(typingTimer);
    const sessionId = localStorage.getItem('activeSessionId');
    if (!sessionId) return;
    
    let session;
    try { session = JSON.parse(localStorage.getItem(sessionId)); if (!session) return; } catch (e) { return; }

    session.typingIndicator = { name: myInfo.name, theme: myInfo.theme, editor: activeEditorId };
    localStorage.setItem(sessionId, JSON.stringify(session));

    typingTimer = setTimeout(() => {
        try {
            session = JSON.parse(localStorage.getItem(sessionId));
            if (!session) return;
            session.typingIndicator = null;
            localStorage.setItem(sessionId, JSON.stringify(session));
        } catch(e) {}
    }, 1500);
}

function updateTypingIndicatorUI(indicator) {
    editors.forEach(editor => { editor.style.boxShadow = 'none'; });
    if (indicator && indicator.name !== myInfo.name) {
        const activeEditor = document.getElementById(indicator.editor);
        if (activeEditor) {
            activeEditor.style.boxShadow = `0 0 0 3px ${indicator.theme} inset`;
            typingIndicatorEl.textContent = `${indicator.name} is typing...`;
            typingIndicatorEl.style.backgroundColor = indicator.theme;
            typingIndicatorEl.style.display = 'block';
        }
    } else {
        typingIndicatorEl.style.display = 'none';
    }
}


// --- Collaboration Host POV ---
function startCollaboration() {
  const sessionId = localStorage.getItem('activeSessionId');
  const sessionStr = sessionId ? localStorage.getItem(sessionId) : null;

  // If already in a session, show the session info
  if (sessionStr && myInfo.name) {
      const currentSession = JSON.parse(sessionStr);
      const collabLink = window.location.href.split('#')[0] + '#' + sessionId;

      modalTitle.innerHTML = '<strong>SESSION DETAILS</strong>';

      let participantsHTML = '<h4>Participants:</h4><ul style="list-style: none; padding: 0; text-align: left;">';
      currentSession.participants.forEach(p => {
          participantsHTML += `<li style="padding: 5px;"><span style="display: inline-block; width: 12px; height: 12px; border-radius: 50%; background-color: ${p.theme}; margin-right: 8px;"></span>${p.name}</li>`;
      });
      participantsHTML += '</ul>';

      modalBody.innerHTML = `
          <p><strong>SHARE THIS LINK TO INVITE OTHERS:</strong></p>
          <input type="text" readonly id="collabLinkInput" value="${collabLink}" style="width: 90%; padding: 8px; text-align: center;">
          <hr style="border-color: var(--border-color); margin: 15px 0;">
          ${participantsHTML}
      `;
      
      document.getElementById('modalActions').innerHTML = `
          <button class="run-button" onclick="copyLink()"><strong>COPY LINK</strong></button>
          <button class="run-button" onclick="closeModal()"><strong>CLOSE</strong></button>
      `;
      collabModal.style.display = 'flex';
      return;
  }

  // Otherwise, start a new session
  modalTitle.innerHTML = '<strong>START COLLABORATION</strong>';
  modalBody.innerHTML = '<p><strong>PLEASE ENTER YOUR NAME TO START:</strong></p><input type="text" id="userNameInput" placeholder="Your Name" style="width: 80%; padding: 8px;">';
  collabModal.style.display = 'flex';
  errorMsgEl.style.display = 'none';

  modalDoneBtn.onclick = () => {
    const userName = document.getElementById('userNameInput').value;
    if (!userName.trim()) return alert('Please enter a name.');
    sessionData.host = userName;
    promptForTheme();
  };
}

function promptForTheme() {
  modalTitle.innerHTML = '<strong>PICK A THEME COLOR</strong>';
  modalBody.innerHTML = `<p><strong>THIS COLOR WILL REPRESENT YOU.</strong></p><input type="color" id="userThemeInput" value="#4CAF50">`;
  errorMsgEl.style.display = 'none';

  modalDoneBtn.onclick = () => {
    sessionData.theme = document.getElementById('userThemeInput').value;
    generateSessionLink();
  };
}

function generateSessionLink() {
  const sessionId = 'session-' + Date.now();
  const collabLink = window.location.href.split('#')[0] + '#' + sessionId;

  const initialState = {
    id: sessionId,
    html: document.getElementById('htmlCode').value,
    css: document.getElementById('cssCode').value,
    js: document.getElementById('jsCode').value,
    participants: [{ name: sessionData.host, theme: sessionData.theme }]
  };
  localStorage.setItem(sessionId, JSON.stringify(initialState));
  localStorage.setItem('activeSessionId', sessionId);

  myInfo = { name: sessionData.host, theme: sessionData.theme };

  modalTitle.innerHTML = '<strong>SHARE THIS LINK WITH FRIENDS!</strong>';
  modalBody.innerHTML = `<p><strong>YOUR SESSION IS READY. COPY THE LINK BELOW:</strong></p><input type="text" readonly id="collabLinkInput" value="${collabLink}" style="width: 90%; padding: 8px; text-align: center;">`;
  document.getElementById('modalActions').innerHTML = `<button class="run-button" onclick="copyLink()"><strong>COPY LINK</strong></button><button class="run-button" onclick="closeModal()"><strong>CLOSE</strong></button>`;
  
  startSyncing();
}

function copyLink() {
  document.getElementById('collabLinkInput').select();
  document.execCommand('copy');
  alert('Link copied to clipboard!');
}

function closeModal() {
  collabModal.style.display = 'none';
  // Restore default "Done" button
  document.getElementById('modalActions').innerHTML = `<button id="modalDoneBtn" class="run-button"><strong>DONE</strong></button>`;
}

// --- Collaboration Friend POV ---
function checkForSession() {
  const sessionId = window.location.hash.substring(1);
  if (sessionId.startsWith('session-')) {
    localStorage.setItem('activeSessionId', sessionId);
    modalTitle.innerHTML = '<strong>JOIN COLLABORATION</strong>';
    modalBody.innerHTML = '<p><strong>PLEASE ENTER YOUR NAME TO JOIN:</strong></p><input type="text" id="userNameInput" placeholder="Your Name" style="width: 80%; padding: 8px;">';
    collabModal.style.display = 'flex';
    errorMsgEl.style.display = 'none';

    modalDoneBtn.onclick = () => {
      const userNameInput = document.getElementById('userNameInput');
      const userName = userNameInput.value;

      if (!userName.trim()) {
        return alert('Please enter a name.');
      }
      
      const sessionStr = localStorage.getItem(sessionId);
      if (sessionStr) {
        const currentSession = JSON.parse(sessionStr);
        const isNameTaken = currentSession.participants.some(p => p.name.toLowerCase() === userName.toLowerCase());

        if (isNameTaken) {
          errorMsgEl.textContent = 'That name is already taken.';
          errorMsgEl.style.display = 'block';
          userNameInput.focus();
          return;
        }
      }
      
      errorMsgEl.style.display = 'none';
      promptForThemeAndJoin(userName);
    };
  }
}

function promptForThemeAndJoin(userName) {
    modalTitle.innerHTML = '<strong>PICK YOUR THEME COLOR</strong>';
    modalBody.innerHTML = `<input type="color" id="userThemeInput" value="#2196F3">`;
    errorMsgEl.style.display = 'none';

    modalDoneBtn.onclick = () => {
        const userTheme = document.getElementById('userThemeInput').value;
        const sessionId = localStorage.getItem('activeSessionId');
        const sessionStr = localStorage.getItem(sessionId);

        if(sessionStr) {
            myInfo = { name: userName, theme: userTheme };
            const currentSession = JSON.parse(sessionStr);
            currentSession.participants.push({ name: userName, theme: userTheme });
            localStorage.setItem(sessionId, JSON.stringify(currentSession));

            document.getElementById('htmlCode').value = currentSession.html;
            document.getElementById('cssCode').value = currentSession.css;
            document.getElementById('jsCode').value = currentSession.js;
            updatePreview();
            
            alert(`Welcome, ${userName}! You've joined the session.`);
            startSyncing();
        } else {
             alert("Error: Collaboration session not found.");
        }
        closeModal();
    };
}

// --- Syncing Logic ---
function handleCodeChange(event) {
    const sessionId = localStorage.getItem('activeSessionId');
    if (!sessionId) return;
    const currentSessionStr = localStorage.getItem(sessionId);
    if (!currentSessionStr) return;
    let session = JSON.parse(currentSessionStr);

    const key = event.target.id.replace('Code', '');
    session[key] = event.target.value;
    
    localStorage.setItem(sessionId, JSON.stringify(session));
}

function startSyncing() {
    editors.forEach(editor => {
        editor.addEventListener('input', handleCodeChange);
        editor.addEventListener('input', (event) => announceTyping(event.target.id));
    });
}

function handleStorageChange(event) {
    const sessionId = localStorage.getItem('activeSessionId');
    if (event.key === sessionId && event.newValue) {
        const newValue = JSON.parse(event.newValue);
        if (document.getElementById('htmlCode').value !== newValue.html) {
            document.getElementById('htmlCode').value = newValue.html;
        }
        if (document.getElementById('cssCode').value !== newValue.css) {
            document.getElementById('cssCode').value = newValue.css;
        }
        if (document.getElementById('jsCode').value !== newValue.js) {
            document.getElementById('jsCode').value = newValue.js;
        }
        
        updateTypingIndicatorUI(newValue.typingIndicator);
        updateLineNumbers();
        if (autoRunCheckbox.checked) updatePreview();
    }
}

// --- Preview Fullscreen Logic ---
function togglePreviewFullscreen() {
  if (!document.fullscreenElement) {
    if (previewIframe.requestFullscreen) {
      previewIframe.requestFullscreen();
    } else if (previewIframe.webkitRequestFullscreen) { /* Safari */
      previewIframe.webkitRequestFullscreen();
    } else if (previewIframe.msRequestFullscreen) { /* IE11 */
      previewIframe.msRequestFullscreen();
    }
  } else {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    }
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
        previewFullscreenBtn.title = 'Exit Fullscreen';
    } else {
        previewFullscreenBtn.innerHTML = `
            <svg class="btn-icon" viewBox="0 0 24 24">
                <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/>
            </svg>
            <strong>FULLSCREEN PREVIEW</strong>
        `;
        previewFullscreenBtn.title = 'Enter Fullscreen';
    }
}