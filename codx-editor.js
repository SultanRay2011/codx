// PART 1: INITIALIZATION & CONSTANTS
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
const newFileBtn = document.getElementById('newFileBtn');
const fileList = document.getElementById('fileList');
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

let hasUnsavedChanges = false;
let autoRunTimeout;
let sessionData = {};
let typingTimer;
let myInfo = {};
let projectFiles = [
  {
    name: 'index.html',
    type: 'html',
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
    active: true
  },
  {
    name: 'style.css',
    type: 'css',
    content: `h1 {
    color: rgb(2, 255, 116);
    text-align: center;
    font-family: Arial, sans-serif;
}`,
    active: false
  },
  {
    name: 'script.js',
    type: 'js',
    content: `console.log('Hello World from CodX!');`,
    active: false
  }
];
let activeFile = projectFiles[0];

const defaultSettings = {
  bgColor: '#1E1E1E',
  textColor: '#ffffff',
  textSize: '14',
  fontFamily: 'monospace'
};

// PART 2: UTILITY FUNCTIONS
function safeLocalStorage(method, key, value = null) {
  try {
    if (method === 'get') return localStorage.getItem(key);
    else if (method === 'set') { localStorage.setItem(key, value); return true; }
    else if (method === 'remove') { localStorage.removeItem(key); return true; }
  } catch (e) {
    console.warn('localStorage not available:', e);
    return null;
  }
}

function showNotification(message, type = 'info') {
  const notification = document.createElement('div');
  notification.textContent = message;
  notification.style.cssText = `
    position: fixed; top: 80px; right: 20px; padding: 15px 20px;
    background: ${type === 'error' ? '#ff5555' : type === 'success' ? '#4CAF50' : '#2196F3'};
    color: white; border-radius: 4px; z-index: 10000; font-weight: bold;
    box-shadow: 0 4px 6px rgba(0,0,0,0.3); animation: slideIn 0.3s ease;
  `;
  document.body.appendChild(notification);
  setTimeout(() => {
    notification.style.animation = 'slideOut 0.3s ease';
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn { from { transform: translateX(400px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
  @keyframes slideOut { from { transform: translateX(0); opacity: 1; } to { transform: translateX(400px); opacity: 0; } }
`;
document.head.appendChild(style);

function clearConsole() {
  consoleOutput.innerHTML = '';
  showNotification('Console cleared', 'info');
}

function debouncedUpdatePreview() {
  clearTimeout(autoRunTimeout);
  autoRunTimeout = setTimeout(updatePreview, 0);
}

function renderFileList() {
  fileList.innerHTML = '';
  projectFiles.forEach(file => {
    const fileItem = document.createElement('div');
    fileItem.className = `file-item ${file.active ? 'active' : ''}`;
    fileItem.innerHTML = `
      <span>${file.name}</span>
      <button class="delete-file" data-file="${file.name}" aria-label="Delete ${file.name}">
        <i class="fa-solid fa-trash"></i>
      </button>
    `;
    fileItem.addEventListener('click', (e) => {
      if (e.target.closest('.delete-file')) return;
      switchFile(file.name);
    });
    fileItem.querySelector('.delete-file').addEventListener('click', () => deleteFile(file.name));
    fileList.appendChild(fileItem);
  });
}

function switchFile(fileName) {
  projectFiles.forEach(file => {
    file.active = file.name === fileName;
    if (file.active) {
      activeFile = file;
      const editor = document.getElementById('activeEditor');
      editor.value = file.content;
      updateLineNumbers(editor);
      syncScroll(editor);
    }
  });
  renderFileList();
  syncProjectWithSession();
}

function createNewFile() {
  const name = prompt('Enter file name (e.g., newfile.html):');
  if (!name) return;
  const ext = name.split('.').pop().toLowerCase();
  if (!['html', 'css', 'js'].includes(ext)) {
    showNotification('File must be .html, .css, or .js', 'error');
    return;
  }
  if (projectFiles.some(file => file.name === name)) {
    showNotification('File name already exists', 'error');
    return;
  }
  const newFile = {
    name,
    type: ext,
    content: '',
    active: true
  };
  projectFiles.forEach(file => (file.active = false));
  projectFiles.push(newFile);
  activeFile = newFile;
  const editor = document.getElementById('activeEditor');
  editor.value = '';
  updateLineNumbers(editor);
  renderFileList();
  syncProjectWithSession();
  showNotification(`File ${name} created`, 'success');
}

function deleteFile(fileName) {
  if (projectFiles.length <= 1) {
    showNotification('Cannot delete the last file', 'error');
    return;
  }
  if (confirm(`Delete ${fileName}?`)) {
    projectFiles = projectFiles.filter(file => file.name !== fileName);
    if (activeFile.name === fileName) {
      activeFile = projectFiles[0];
      activeFile.active = true;
      const editor = document.getElementById('activeEditor');
      editor.value = activeFile.content;
      updateLineNumbers(editor);
      syncScroll(editor);
    }
    renderFileList();
    syncProjectWithSession();
    showNotification(`File ${fileName} deleted`, 'success');
  }
}

// PART 3: SETTINGS MANAGEMENT
function loadSettings() {
  const savedSettings = safeLocalStorage('get', 'editorSettings');
  if (savedSettings) {
    try {
      const settings = JSON.parse(savedSettings);
      editorBgColorInput.value = settings.bgColor;
      editorBgColorText.value = settings.bgColor;
      editorTextColorInput.value = settings.textColor;
      editorTextColorText.value = settings.textColor;
      editorTextSizeInput.value = settings.textSize;
      textSizeValue.textContent = settings.textSize + 'px';
      editorFontFamilySelect.value = settings.fontFamily;
    } catch (e) {
      console.error('Error loading settings:', e);
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
  textSizeValue.textContent = defaultSettings.textSize + 'px';
  editorFontFamilySelect.value = defaultSettings.fontFamily;
}

function updatePreviewBox() {
  settingsPreview.style.backgroundColor = editorBgColorInput.value;
  settingsPreview.style.color = editorTextColorInput.value;
  settingsPreview.style.fontSize = editorTextSizeInput.value + 'px';
  settingsPreview.style.fontFamily = editorFontFamilySelect.value;
}

function applySettingsToEditors() {
  const editor = document.getElementById('activeEditor');
  editor.style.backgroundColor = editorBgColorInput.value;
  editor.style.color = editorTextColorInput.value;
  editor.style.fontSize = editorTextSizeInput.value + 'px';
  editor.style.fontFamily = editorFontFamilySelect.value;
  lineNumbers.style.fontSize = editorTextSizeInput.value + 'px';
}

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

settingsBtn.addEventListener('click', () => {
  loadSettings();
  settingsModal.style.display = 'flex';
});

closeSettingsBtn.addEventListener('click', () => {
  settingsModal.style.display = 'none';
});

settingsModal.addEventListener('click', (e) => {
  if (e.target === settingsModal) settingsModal.style.display = 'none';
});

applySettingsBtn.addEventListener('click', () => {
  const settings = {
    bgColor: editorBgColorInput.value,
    textColor: editorTextColorInput.value,
    textSize: editorTextSizeInput.value,
    fontFamily: editorFontFamilySelect.value
  };
  if (safeLocalStorage('set', 'editorSettings', JSON.stringify(settings))) {
    applySettingsToEditors();
    showNotification('Settings applied successfully!', 'success');
    settingsModal.style.display = 'none';
  } else {
    showNotification('Error saving settings', 'error');
  }
});

resetSettingsBtn.addEventListener('click', () => {
  if (confirm('Are you sure you want to reset all settings to default?')) {
    safeLocalStorage('remove', 'editorSettings');
    resetToDefaultSettings();
    updatePreviewBox();
    applySettingsToEditors();
    showNotification('Settings reset to default!', 'success');
  }
});

// PART 4: THEME & UI CONTROLS
themeToggle.addEventListener('change', () => {
  document.body.classList.toggle('light', themeToggle.checked);
  safeLocalStorage('set', 'theme', themeToggle.checked ? 'light' : 'dark');
});

const savedTheme = safeLocalStorage('get', 'theme');
if (savedTheme === 'light') {
  themeToggle.checked = true;
  document.body.classList.add('light');
}

showConsoleCheckbox.addEventListener('change', () => {
  consoleContainer.classList.toggle('show', showConsoleCheckbox.checked);
});

// PART 5: PREVIEW & LINE NUMBERS (FIXED FILE LINKING)
function updatePreview() {
  const htmlFile = projectFiles.find(f => f.type === 'html');
  if (!htmlFile) {
    iframe.srcdoc = '<h3 style="text-align:center;color:#aaa;">No HTML file found</h3>';
    return;
  }

  let html = htmlFile.content;
  consoleOutput.innerHTML = '';

  // Replace <link rel="stylesheet" href="style.css">
  html = html.replace(/<link[^>]*rel=["']stylesheet["'][^>]*href=["']([^"']+)["'][^>]*>/gi, (match, href) => {
    const cssFile = projectFiles.find(f => f.name.toLowerCase() === href.toLowerCase() && f.type === 'css');
    if (cssFile) {
      return `<style>${cssFile.content}</style>`;
    } else {
      appendConsoleMessage('warn', `WARNING: CSS file not found: ${href}`);
      return match;
    }
  });

  // Replace <script src="script.js"></script>
  html = html.replace(/<script[^>]*src=["']([^"']+)["'][^>]*><\/script>/gi, (match, src) => {
    const jsFile = projectFiles.find(f => f.name.toLowerCase() === src.toLowerCase() && f.type === 'js');
    if (jsFile) {
      return `<script>${jsFile.content}</script>`;
    } else {
      appendConsoleMessage('warn', `WARNING: JS file not found: ${src}`);
      return match;
    }
  });

  // Inject console override
  const jsWithConsole = `
    <script>
      const parentConsole = parent.document.getElementById('consoleOutput');
      function appendMessage(type, prefix, args) {
        const line = document.createElement('div');
        line.className = type;
        line.textContent = prefix + args.map(arg => 
          typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
        ).join(' ');
        parentConsole.appendChild(line);
        parentConsole.scrollTop = parentConsole.scrollHeight;
      }
      console.log = (...args) => appendMessage('log', '> ', args);
      console.warn = (...args) => appendMessage('warn', 'WARNING: ', args);
      console.error = (...args) => appendMessage('error', 'ERROR: ', args);
      console.info = (...args) => appendMessage('info', 'INFO: ', args);
      window.onerror = (msg, src, line) => { 
        appendMessage('error', 'Uncaught: ', [msg + ' (line ' + line + ')']); 
        return false; 
      };
      window.addEventListener('unhandledrejection', e => 
        appendMessage('error', 'Promise: ', [e.reason])
      );
    </script>`;

  iframe.srcdoc = html + jsWithConsole;
}

// Helper to append to console from iframe
function appendConsoleMessage(type, message) {
  const line = document.createElement('div');
  line.className = type;
  line.textContent = message;
  consoleOutput.appendChild(line);
  consoleOutput.scrollTop = consoleOutput.scrollHeight;
}

function updateLineNumbers(textarea) {
  if (!textarea) textarea = document.getElementById('activeEditor');
  if (!textarea) return;
  const lines = textarea.value.split('\n').length;
  lineNumbers.textContent = Array.from({ length: lines }, (_, i) => i + 1).join('\n');
}

function syncScroll(textarea) {
  if (!textarea) return;
  textarea.addEventListener('scroll', () => { 
    lineNumbers.scrollTop = textarea.scrollTop; 
  });
}

// PART 6: EDITOR INITIALIZATION
function initializeEditor() {
  const editor = document.getElementById('activeEditor');
  editor.value = activeFile.content;
  updateLineNumbers(editor);
  syncScroll(editor);
  editor.addEventListener('input', () => {
    hasUnsavedChanges = true;
    activeFile.content = editor.value;
    updateLineNumbers(editor);
    if (autoRunCheckbox.checked) debouncedUpdatePreview();
    handleCodeChange({ target: { id: activeFile.type + 'Code', value: editor.value } });
    announceTyping(activeFile.type + 'Code');
  });
  editor.addEventListener('keydown', function(e) {
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = this.selectionStart, end = this.selectionEnd;
      this.value = this.value.substring(0, start) + "  " + this.value.substring(end);
      this.selectionStart = this.selectionEnd = start + 2;
      activeFile.content = this.value;
      updateLineNumbers(this);
      if (autoRunCheckbox.checked) debouncedUpdatePreview();
      handleCodeChange({ target: { id: activeFile.type + 'Code', value: this.value } });
    }
  });
}

// PART 7: KEYBOARD SHORTCUTS
document.addEventListener('keydown', (e) => {
  if (e.ctrlKey && e.key === 's') {
    e.preventDefault();
    exportAsZip();
  }
  if (e.ctrlKey && e.key === 'Enter') {
    e.preventDefault();
    updatePreview();
  }
  if (e.ctrlKey && e.key === 'n') {
    e.preventDefault();
    createNewFile();
  }
  if (e.ctrlKey && e.shiftKey && e.key === 'C') {
    e.preventDefault();
    showConsoleCheckbox.checked = !showConsoleCheckbox.checked;
    showConsoleCheckbox.dispatchEvent(new Event('change'));
  }
});

// PART 8: DRAG & DROP
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
      const ext = file.name.split('.').pop().toLowerCase();
      if (['html', 'css', 'js'].includes(ext)) {
        if (projectFiles.some(f => f.name === file.name)) {
          showNotification(`File ${file.name} already exists`, 'error');
          return;
        }
        const newFile = { name: file.name, type: ext, content, active: false };
        projectFiles.push(newFile);
        if (projectFiles.length === 1) {
          newFile.active = true;
          activeFile = newFile;
          document.getElementById('activeEditor').value = content;
          updateLineNumbers();
        }
        renderFileList();
        syncProjectWithSession();
        showNotification(`Imported: ${file.name}`, 'success');
      }
    };
    reader.readAsText(file);
  }
});

// PART 9: ZIP EXPORT
async function exportAsZip() {
  const zip = new JSZip();
  projectFiles.forEach(file => {
    zip.file(file.name, file.content);
  });
  try {
    const content = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(content);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'codx-project.zip';
    a.click();
    URL.revokeObjectURL(url);
    showNotification('Project exported as ZIP!', 'success');
  } catch (err) {
    console.error('Export error:', err);
    showNotification('Error creating ZIP file', 'error');
  }
}

// PART 10: ZIP IMPORT
function importZip() { 
  document.getElementById('zipFileInput').click(); 
}

function handleZipImport(event) {
  const file = event.target.files[0];
  if (!file) return;
  
  if (!file.name.endsWith('.zip')) {
    showNotification('Please select a valid ZIP file', 'error');
    return;
  }
  
  JSZip.loadAsync(file).then(zip => {
    const promises = [];
    projectFiles = [];
    const foundFiles = [];
    
    zip.forEach((path, entry) => {
      const ext = path.split('.').pop().toLowerCase();
      if (['html', 'css', 'js'].includes(ext) && !entry.dir) {
        foundFiles.push(path);
        promises.push(entry.async("string").then(content => {
          projectFiles.push({
            name: path,
            type: ext,
            content,
            active: false
          });
        }));
      }
    });
    
    Promise.all(promises).then(() => {
      if (projectFiles.length === 0) {
        showNotification('No valid files found in ZIP', 'error');
        return;
      }
      projectFiles[0].active = true;
      activeFile = projectFiles[0];
      const editor = document.getElementById('activeEditor');
      editor.value = activeFile.content;
      updateLineNumbers(editor);
      renderFileList();
      if (autoRunCheckbox.checked) updatePreview();
      syncProjectWithSession();
      showNotification(`Project imported! Files: ${foundFiles.join(', ')}`, 'success');
    });
  }).catch(err => {
    console.error('Import error:', err);
    showNotification('Error reading ZIP file.', 'error');
  });
  event.target.value = '';
}

// PART 11: FULLSCREEN
previewFullscreenBtn.addEventListener('click', togglePreviewFullscreen);
document.addEventListener('fullscreenchange', updateFullscreenButtonState);

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
closeModalBtn.addEventListener('click', closeModal);
collabBtn.addEventListener('click', startCollaboration);
window.addEventListener('load', checkForSession);
window.addEventListener('storage', handleStorageChange);

// ---- 1. Generate a numeric-only unique ID ----
function generateNumericSessionId() {
  const ts = Date.now();                     // 13-digit timestamp
  const rnd = Math.floor(Math.random() * 1000); // 0-999
  return `${ts}${rnd}`;                      // e.g. 17234567890123
}

// ---- 2. Typing indicator (unchanged) ----
function announceTyping(activeEditorId) {
  if (!myInfo.name) return;
  clearTimeout(typingTimer);
  const sessionId = safeLocalStorage('get', 'activeSessionId');
  if (!sessionId) return;

  let session;
  try {
    const s = safeLocalStorage('get', sessionId);
    session = s ? JSON.parse(s) : null;
  } catch { return; }

  if (session) {
    session.typingIndicator = { name: myInfo.name, theme: myInfo.theme, editor: activeEditorId };
    safeLocalStorage('set', sessionId, JSON.stringify(session));
  }

  typingTimer = setTimeout(() => {
    try {
      const s = safeLocalStorage('get', sessionId);
      if (s) {
        const sess = JSON.parse(s);
        sess.typingIndicator = null;
        safeLocalStorage('set', sessionId, JSON.stringify(sess));
      }
    } catch {}
  }, 1500);
}

function updateTypingIndicatorUI(ind) {
  const ed = document.getElementById('activeEditor');
  ed.style.boxShadow = 'none';
  if (ind && ind.name !== myInfo.name && ind.editor === activeFile.type + 'Code') {
    ed.style.boxShadow = `0 0 0 3px ${ind.theme} inset`;
    typingIndicatorEl.textContent = `${ind.name} is typing...`;
    typingIndicatorEl.style.backgroundColor = ind.theme;
    typingIndicatorEl.style.display = 'block';
  } else {
    typingIndicatorEl.style.display = 'none';
  }
}

// ---- 3. Username validation (unchanged) ----
function validateUsername(u) {
  if (!u || !u.trim()) return { valid: false, error: 'Enter a name.' };
  if (u.length < 2) return { valid: false, error: 'At least 2 characters.' };
  if (u.length > 20) return { valid: false, error: 'Max 20 characters.' };
  if (!/^[a-zA-Z0-9\s_-]+$/.test(u)) return { valid: false, error: 'Only letters, numbers, space, _ , -.' };
  return { valid: true };
}

// ---- 4. Start a new session (host) ----
function startCollaboration() {
  const sid = safeLocalStorage('get', 'activeSessionId');
  const data = sid ? safeLocalStorage('get', sid) : null;

  // Already in a session → show details
  if (data && myInfo.name) {
    showSessionDetails(sid);
    return;
  }

  // Fresh session
  modalTitle.innerHTML = '<strong>START COLLAB</strong>';
  modalBody.innerHTML = '<p><strong>Your name:</strong></p><input type="text" id="userNameInput" placeholder="Name" style="width:80%;padding:8px;" maxlength="20">';
  collabModal.style.display = 'flex';
  errorMsgEl.style.display = 'none';

  modalDoneBtn.onclick = () => {
    const name = document.getElementById('userNameInput').value.trim();
    const v = validateUsername(name);
    if (!v.valid) { errorMsgEl.textContent = v.error; errorMsgEl.style.display = 'block'; return; }
    errorMsgEl.style.display = 'none';
    sessionData.host = name;
    promptForTheme();
  };
}

function promptForTheme() {
  modalTitle.innerHTML = '<strong>PICK COLOR</strong>';
  modalBody.innerHTML = `<p><strong>Your color:</strong></p><input type="color" id="userThemeInput" value="#4CAF50">`;
  errorMsgEl.style.display = 'none';

  modalDoneBtn.onclick = () => {
    sessionData.theme = document.getElementById('userThemeInput').value;
    createNumericSession();
  };
}

function createNumericSession() {
  const sid = generateNumericSessionId();               // numeric only
  const link = window.location.href.split('#')[0] + '#' + sid;

  const init = {
    id: sid,
    files: projectFiles,
    participants: [{ name: sessionData.host, theme: sessionData.theme }]
  };

  if (!safeLocalStorage('set', sid, JSON.stringify(init))) {
    showNotification('Storage full – cannot create session', 'error');
    return;
  }

  safeLocalStorage('set', 'activeSessionId', sid);
  myInfo = { name: sessionData.host, theme: sessionData.theme };

  modalTitle.innerHTML = '<strong>SHARE LINK</strong>';
  modalBody.innerHTML = `<input type="text" readonly id="collabLinkInput" value="${link}" style="width:90%;padding:8px;text-align:center;">`;
  document.getElementById('modalActions').innerHTML = `
    <button class="run-button" onclick="copyLink()"><strong>COPY</strong></button>
    <button class="run-button" onclick="closeModal()"><strong>DONE</strong></button>`;
  startSyncing();
}

// ---- 5. Show existing session details (for host or participants) ----
function showSessionDetails(sid) {
  const data = safeLocalStorage('get', sid);
  if (!data) return;

  const sess = JSON.parse(data);
  const link = window.location.href.split('#')[0] + '#' + sid;

  modalTitle.innerHTML = '<strong>SESSION INFO</strong>';
  let list = '<h4>Participants:</h4><ul style="list-style:none;padding:0;text-align:left;">';
  sess.participants.forEach(p => {
    list += `<li style="padding:5px;"><span style="display:inline-block;width:12px;height:12px;border-radius:50%;background:${p.theme};margin-right:8px;"></span>${p.name}</li>`;
  });
  list += '</ul>';

  modalBody.innerHTML = `
    <p><strong>Share:</strong></p>
    <input type="text" readonly id="collabLinkInput" value="${link}" style="width:90%;padding:8px;text-align:center;">
    <hr style="border-color:var(--border-color);margin:15px 0;">
    ${list}
  `;

  document.getElementById('modalActions').innerHTML = `
    <button class="run-button" onclick="copyLink()"><strong>COPY LINK</strong></button>
    <button class="run-button" onclick="closeModal()"><strong>CLOSE</strong></button>`;
  collabModal.style.display = 'flex';
}

// ---- 6. Copy link helper ----
function copyLink() {
  const el = document.getElementById('collabLinkInput');
  el.select(); el.setSelectionRange(0, 99999);
  try { document.execCommand('copy'); showNotification('Copied!', 'success'); }
  catch { navigator.clipboard.writeText(el.value).then(() => showNotification('Copied!', 'success')); }
}

// ---- 7. Close modal (reset button) ----
function closeModal() {
  collabModal.style.display = 'none';
  document.getElementById('modalActions').innerHTML = `<button id="modalDoneBtn" class="run-button"><strong>DONE</strong></button>`;
}

// ---- 8. Check URL hash on load (join or error) ----
function checkForSession() {
  const hash = window.location.hash.substring(1);
  if (!/^\d+$/.test(hash)) return;   // only digits allowed

  const stored = safeLocalStorage('get', hash);
  if (!stored) {
    // ---- INVALID / EXPIRED LINK ----
    modalTitle.innerHTML = '<strong>SESSION NOT FOUND</strong>';
    modalBody.innerHTML = `
      <p style="color:#ff5555;"><strong>This link is invalid or the session has expired.</strong></p>
      <p>Ask the host for a new link.</p>`;
    document.getElementById('modalActions').innerHTML = `
      <button class="run-button" onclick="closeModal()" style="background:#ff5555;"><strong>CLOSE</strong></button>`;
    collabModal.style.display = 'flex';
    return;
  }

  safeLocalStorage('set', 'activeSessionId', hash);
  modalTitle.innerHTML = '<strong>JOIN SESSION</strong>';
  modalBody.innerHTML = '<p><strong>Your name:</strong></p><input type="text" id="userNameInput" placeholder="Name" style="width:80%;padding:8px;" maxlength="20">';
  collabModal.style.display = 'flex';
  errorMsgEl.style.display = 'none';

  modalDoneBtn.onclick = () => {
    const name = document.getElementById('userNameInput').value.trim();
    const v = validateUsername(name);
    if (!v.valid) { errorMsgEl.textContent = v.error; errorMsgEl.style.display = 'block'; return; }

    const sess = JSON.parse(stored);
    const taken = sess.participants.some(p => p.name.toLowerCase() === name.toLowerCase());
    if (taken) { errorMsgEl.textContent = 'Name already taken.'; errorMsgEl.style.display = 'block'; return; }

    errorMsgEl.style.display = 'none';
    promptJoinTheme(name, hash);
  };
}

// ---- 9. Choose color & join ----
function promptJoinTheme(name, sid) {
  modalTitle.innerHTML = '<strong>PICK COLOR</strong>';
  modalBody.innerHTML = `<p><strong>Your color:</strong></p><input type="color" id="userThemeInput" value="#2196F3">`;
  errorMsgEl.style.display = 'none';

  modalDoneBtn.onclick = () => {
    const theme = document.getElementById('userThemeInput').value;
    const data = safeLocalStorage('get', sid);
    if (!data) { showNotification('Session gone.', 'error'); closeModal(); return; }

    myInfo = { name, theme };
    const sess = JSON.parse(data);
    sess.participants.push({ name, theme });
    projectFiles = sess.files;
    activeFile = projectFiles.find(f => f.active) || projectFiles[0];
    projectFiles.forEach(f => f.active = f === activeFile);

    const ed = document.getElementById('activeEditor');
    ed.value = activeFile.content;
    updateLineNumbers(ed);
    renderFileList();
    updatePreview();
    safeLocalStorage('set', sid, JSON.stringify(sess));

    showNotification(`Welcome, ${name}!`, 'success');
    startSyncing();
    closeModal();
  };
}

// ---- 10. Sync helpers (unchanged) ----
function handleCodeChange() {
  const sid = safeLocalStorage('get', 'activeSessionId');
  if (!sid) return;
  const s = safeLocalStorage('get', sid);
  if (!s) return;
  try {
    const sess = JSON.parse(s);
    sess.files = projectFiles;
    safeLocalStorage('set', sid, JSON.stringify(sess));
  } catch (e) { console.error('sync err', e); }
}

function syncProjectWithSession() {
  const sid = safeLocalStorage('get', 'activeSessionId');
  if (!sid) return;
  const s = safeLocalStorage('get', sid);
  if (!s) return;
  try {
    const sess = JSON.parse(s);
    sess.files = projectFiles;
    safeLocalStorage('set', sid, JSON.stringify(sess));
  } catch (e) { console.error('sync err', e); }
}

function startSyncing() {
  const ed = document.getElementById('activeEditor');
  ed.addEventListener('input', handleCodeChange);
  ed.addEventListener('input', () => announceTyping(activeFile.type + 'Code'));
}

function handleStorageChange(e) {
  const sid = safeLocalStorage('get', 'activeSessionId');
  if (e.key === sid && e.newValue) {
    try {
      const nv = JSON.parse(e.newValue);
      if (JSON.stringify(projectFiles) !== JSON.stringify(nv.files)) {
        projectFiles = nv.files;
        activeFile = projectFiles.find(f => f.active) || projectFiles[0];
        projectFiles.forEach(f => f.active = f === activeFile);
        const ed = document.getElementById('activeEditor');
        ed.value = activeFile.content;
        updateLineNumbers(ed);
        renderFileList();
        if (autoRunCheckbox.checked) updatePreview();
      }
      updateTypingIndicatorUI(nv.typingIndicator);
    } catch (er) { console.error('storage sync err', er); }
  }
}

// PART: MEDIA FILE HANDLER
const addMediaBtn = document.getElementById('addMediaBtn');
const mediaInput = document.createElement('input');
mediaInput.type = 'file';
mediaInput.accept = 'image/*,video/mp4,audio/mp3';
mediaInput.multiple = true;
mediaInput.style.display = 'none';
document.body.appendChild(mediaInput);

addMediaBtn.addEventListener('click', () => mediaInput.click());

mediaInput.addEventListener('change', (e) => {
  const files = Array.from(e.target.files);
  if (!files.length) return;

  files.forEach(file => {
    const reader = new FileReader();
    reader.onload = ev => {
      const base64 = ev.target.result;
      const name = file.name;
      const ext = name.split('.').pop().toLowerCase();
      const type = ['jpg','jpeg','png','gif','webp'].includes(ext) ? 'img' :
                   ext === 'mp4' ? 'video' : 'audio';

      const newFile = {
        name,
        type: 'media',
        mediaType: type,
        content: base64,
        active: false
      };

      if (!projectFiles.some(f => f.name === name)) {
        projectFiles.push(newFile);
        showNotification(`Added: ${name}`, 'success');
      } else {
        showNotification(`${name} already exists`, 'warn');
      }
      renderFileList();
      syncProjectWithSession();
    };
    reader.readAsDataURL(file);
  });
  mediaInput.value = '';
});

// PART 13: INITIALIZATION
window.addEventListener('load', () => {
  loadSettings();
  renderFileList();
  initializeEditor();
  updatePreview();
});

window.addEventListener('beforeunload', function (e) {
  if (hasUnsavedChanges) {
    e.preventDefault();
    e.returnValue = '';
    return 'Are you sure you want to leave? Your changes may not be saved.';
  }
});

newFileBtn.addEventListener('click', createNewFile);

console.log('CodX Editor loaded with file linking!');