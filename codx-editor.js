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
</head>
<body>
    <h1>Welcome to CodX Editor</h1>
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
  autoRunTimeout = setTimeout(updatePreview, 500);
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

// PART 5: PREVIEW & LINE NUMBERS
function updatePreview() {
  const htmlFiles = projectFiles.filter(file => file.type === 'html');
  const cssFiles = projectFiles.filter(file => file.type === 'css');
  const jsFiles = projectFiles.filter(file => file.type === 'js');
  
  const html = htmlFiles.length > 0 ? htmlFiles[0].content : '';
  const css = cssFiles.map(file => `<style>${file.content}</style>`).join('');
  const js = jsFiles.map(file => file.content).join('\n');
  
  consoleOutput.innerHTML = '';
  
  let jsWithConsole = '';
  if (js.trim()) {
    jsWithConsole = `<script>
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
      console.log = (...args) => { appendMessage('log', '> ', args); };
      console.warn = (...args) => { appendMessage('warn', '⚠️ WARNING: ', args); };
      console.error = (...args) => { appendMessage('error', '❌ ERROR: ', args); };
      console.info = (...args) => { appendMessage('info', 'ℹ️ INFO: ', args); };
      window.onerror = (msg, src, line) => { 
        appendMessage('error', '❌ Uncaught: ', [msg + ' (line ' + line + ')']); 
        return false; 
      };
      window.addEventListener('unhandledrejection', e => 
        appendMessage('error', '❌ Promise: ', [e.reason])
      );
      try { ${js} } catch(e) { 
        appendMessage('error', '❌ Script Error: ', [e.message]); 
      }
    </script>`;
  }
  
  iframe.srcdoc = html + css + jsWithConsole;
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
        const newFile = {
          name: file.name,
          type: ext,
          content,
          active: true
        };
        projectFiles.forEach(f => (f.active = false));
        projectFiles.push(newFile);
        activeFile = newFile;
        const editor = document.getElementById('activeEditor');
        editor.value = content;
        updateLineNumbers(editor);
        renderFileList();
        if (autoRunCheckbox.checked) updatePreview();
        syncProjectWithSession();
        showNotification(`${file.name} loaded successfully!`, 'success');
      } else {
        showNotification(`Unsupported file type: .${ext}`, 'error');
      }
    };
    reader.readAsText(file);
  }
});

// PART 9: RESIZABLE PANELS
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

// PART 10: ZIP IMPORT/EXPORT
function exportAsZip() {
  try {
    hasUnsavedChanges = false;
    const zip = new JSZip();
    projectFiles.forEach(file => {
      zip.file(file.name, file.content);
    });
    zip.generateAsync({ type: "blob" }).then(content => {
      const a = document.createElement("a");
      a.href = URL.createObjectURL(content);
      a.download = "codx-project.zip";
      a.click();
      showNotification('Project exported successfully!', 'success');
      setTimeout(() => URL.revokeObjectURL(a.href), 100);
    }).catch(err => {
      console.error('Export error:', err);
      showNotification('Error exporting project', 'error');
    });
  } catch (err) {
    console.error('Export error:', err);
    showNotification('Error creating ZIP file', 'error');
  }
}

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
    showNotification('Error reading ZIP file. Please check the file format.', 'error');
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

// PART 12: COLLABORATION FEATURES
closeModalBtn.addEventListener('click', closeModal);
collabBtn.addEventListener('click', startCollaboration);
window.addEventListener('load', checkForSession);
window.addEventListener('storage', handleStorageChange);

function announceTyping(activeEditorId) {
  if (!myInfo.name) return;
  clearTimeout(typingTimer);
  const sessionId = safeLocalStorage('get', 'activeSessionId');
  if (!sessionId) return;
  
  let session;
  try { 
    const sessionStr = safeLocalStorage('get', sessionId);
    session = JSON.parse(sessionStr); 
    if (!session) return; 
  } catch (e) { return; }

  session.typingIndicator = { name: myInfo.name, theme: myInfo.theme, editor: activeEditorId };
  safeLocalStorage('set', sessionId, JSON.stringify(session));

  typingTimer = setTimeout(() => {
    try {
      const sessionStr = safeLocalStorage('get', sessionId);
      session = JSON.parse(sessionStr);
      if (!session) return;
      session.typingIndicator = null;
      safeLocalStorage('set', sessionId, JSON.stringify(session));
    } catch(e) {}
  }, 1500);
}

function updateTypingIndicatorUI(indicator) {
  const editor = document.getElementById('activeEditor');
  editor.style.boxShadow = 'none';
  if (indicator && indicator.name !== myInfo.name) {
    if (indicator.editor === activeFile.type + 'Code') {
      editor.style.boxShadow = `0 0 0 3px ${indicator.theme} inset`;
      typingIndicatorEl.textContent = `${indicator.name} is typing...`;
      typingIndicatorEl.style.backgroundColor = indicator.theme;
      typingIndicatorEl.style.display = 'block';
    }
  } else {
    typingIndicatorEl.style.display = 'none';
  }
}

function validateUsername(username) {
  if (!username || username.trim().length === 0) {
    return { valid: false, error: 'Please enter a name.' };
  }
  if (username.length < 2) {
    return { valid: false, error: 'Name must be at least 2 characters.' };
  }
  if (username.length > 20) {
    return { valid: false, error: 'Name must be less than 20 characters.' };
  }
  if (!/^[a-zA-Z0-9\s_-]+$/.test(username)) {
    return { valid: false, error: 'Name can only contain letters, numbers, spaces, underscores, and hyphens.' };
  }
  return { valid: true };
}

function startCollaboration() {
  const sessionId = safeLocalStorage('get', 'activeSessionId');
  const sessionStr = sessionId ? safeLocalStorage('get', sessionId) : null;

  if (sessionStr && myInfo.name) {
    try {
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
    } catch (e) {
      console.error('Error loading session:', e);
      showNotification('Error loading collaboration session', 'error');
    }
    return;
  }

  modalTitle.innerHTML = '<strong>START COLLABORATION</strong>';
  modalBody.innerHTML = '<p><strong>PLEASE ENTER YOUR NAME TO START:</strong></p><input type="text" id="userNameInput" placeholder="Your Name" style="width: 80%; padding: 8px;" maxlength="20">';
  collabModal.style.display = 'flex';
  errorMsgEl.style.display = 'none';

  modalDoneBtn.onclick = () => {
    const userName = document.getElementById('userNameInput').value.trim();
    const validation = validateUsername(userName);
    
    if (!validation.valid) {
      errorMsgEl.textContent = validation.error;
      errorMsgEl.style.display = 'block';
      return;
    }
    
    errorMsgEl.style.display = 'none';
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
    files: projectFiles,
    participants: [{ name: sessionData.host, theme: sessionData.theme }]
  };
  
  if (!safeLocalStorage('set', sessionId, JSON.stringify(initialState))) {
    showNotification('Error creating session. localStorage may be full.', 'error');
    return;
  }
  
  safeLocalStorage('set', 'activeSessionId', sessionId);
  myInfo = { name: sessionData.host, theme: sessionData.theme };

  modalTitle.innerHTML = '<strong>SHARE THIS LINK WITH FRIENDS!</strong>';
  modalBody.innerHTML = `<p><strong>YOUR SESSION IS READY. COPY THE LINK BELOW:</strong></p><input type="text" readonly id="collabLinkInput" value="${collabLink}" style="width: 90%; padding: 8px; text-align: center;">`;
  document.getElementById('modalActions').innerHTML = `<button class="run-button" onclick="copyLink()"><strong>COPY LINK</strong></button><button class="run-button" onclick="closeModal()"><strong>CLOSE</strong></button>`;
  
  startSyncing();
}

function copyLink() {
  const linkInput = document.getElementById('collabLinkInput');
  linkInput.select();
  linkInput.setSelectionRange(0, 99999);
  
  try {
    document.execCommand('copy');
    showNotification('Link copied to clipboard!', 'success');
  } catch (err) {
    navigator.clipboard.writeText(linkInput.value).then(() => {
      showNotification('Link copied to clipboard!', 'success');
    }).catch(() => {
      showNotification('Failed to copy link. Please copy manually.', 'error');
    });
  }
}

function closeModal() {
  collabModal.style.display = 'none';
  document.getElementById('modalActions').innerHTML = `<button id="modalDoneBtn" class="run-button"><strong>DONE</strong></button>`;
}

function checkForSession() {
  const sessionId = window.location.hash.substring(1);
  if (sessionId.startsWith('session-')) {
    safeLocalStorage('set', 'activeSessionId', sessionId);
    modalTitle.innerHTML = '<strong>JOIN COLLABORATION</strong>';
    modalBody.innerHTML = '<p><strong>PLEASE ENTER YOUR NAME TO JOIN:</strong></p><input type="text" id="userNameInput" placeholder="Your Name" style="width: 80%; padding: 8px;" maxlength="20">';
    collabModal.style.display = 'flex';
    errorMsgEl.style.display = 'none';

    modalDoneBtn.onclick = () => {
      const userNameInput = document.getElementById('userNameInput');
      const userName = userNameInput.value.trim();

      const validation = validateUsername(userName);
      if (!validation.valid) {
        errorMsgEl.textContent = validation.error;
        errorMsgEl.style.display = 'block';
        userNameInput.focus();
        return;
      }
      
      const sessionStr = safeLocalStorage('get', sessionId);
      if (sessionStr) {
        try {
          const currentSession = JSON.parse(sessionStr);
          const isNameTaken = currentSession.participants.some(p => 
            p.name.toLowerCase() === userName.toLowerCase()
          );

          if (isNameTaken) {
            errorMsgEl.textContent = 'That name is already taken. Please choose another.';
            errorMsgEl.style.display = 'block';
            userNameInput.focus();
            return;
          }
        } catch (e) {
          console.error('Error checking session:', e);
          showNotification('Error loading session', 'error');
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
  modalBody.innerHTML = `<p><strong>THIS COLOR WILL REPRESENT YOU.</strong></p><input type="color" id="userThemeInput" value="#2196F3">`;
  errorMsgEl.style.display = 'none';

  modalDoneBtn.onclick = () => {
    const userTheme = document.getElementById('userThemeInput').value;
    const sessionId = safeLocalStorage('get', 'activeSessionId');
    const sessionStr = safeLocalStorage('get', sessionId);

    if (sessionStr) {
      try {
        myInfo = { name: userName, theme: userTheme };
        const currentSession = JSON.parse(sessionStr);
        currentSession.participants.push({ name: userName, theme: userTheme });
        projectFiles = currentSession.files;
        if (!projectFiles.some(file => file.active)) {
          projectFiles[0].active = true;
          activeFile = projectFiles[0];
        }
        activeFile = projectFiles.find(file => file.active) || projectFiles[0];
        const editor = document.getElementById('activeEditor');
        editor.value = activeFile.content;
        updateLineNumbers(editor);
        renderFileList();
        updatePreview();
        safeLocalStorage('set', sessionId, JSON.stringify(currentSession));
        
        showNotification(`Welcome, ${userName}! You've joined the session.`, 'success');
        startSyncing();
      } catch (e) {
        console.error('Error joining session:', e);
        showNotification('Error joining session', 'error');
      }
    } else {
      showNotification('Error: Collaboration session not found.', 'error');
    }
    closeModal();
  };
}

function handleCodeChange(event) {
  const sessionId = safeLocalStorage('get', 'activeSessionId');
  if (!sessionId) return;
  const currentSessionStr = safeLocalStorage('get', sessionId);
  if (!currentSessionStr) return;
  
  try {
    let session = JSON.parse(currentSessionStr);
    session.files = projectFiles;
    safeLocalStorage('set', sessionId, JSON.stringify(session));
  } catch (e) {
    console.error('Error syncing changes:', e);
  }
}

function syncProjectWithSession() {
  const sessionId = safeLocalStorage('get', 'activeSessionId');
  if (!sessionId) return;
  const sessionStr = safeLocalStorage('get', sessionId);
  if (!sessionStr) return;
  
  try {
    const session = JSON.parse(sessionStr);
    session.files = projectFiles;
    safeLocalStorage('set', sessionId, JSON.stringify(session));
  } catch (e) {
    console.error('Error syncing project:', e);
  }
}

function startSyncing() {
  const editor = document.getElementById('activeEditor');
  editor.addEventListener('input', handleCodeChange);
  editor.addEventListener('input', (event) => announceTyping(activeFile.type + 'Code'));
}

function handleStorageChange(event) {
  const sessionId = safeLocalStorage('get', 'activeSessionId');
  if (event.key === sessionId && event.newValue) {
    try {
      const newValue = JSON.parse(event.newValue);
      if (JSON.stringify(projectFiles) !== JSON.stringify(newValue.files)) {
        projectFiles = newValue.files;
        if (!projectFiles.some(file => file.active)) {
          projectFiles[0].active = true;
          activeFile = projectFiles[0];
        }
        activeFile = projectFiles.find(file => file.active) || projectFiles[0];
        const editor = document.getElementById('activeEditor');
        editor.value = activeFile.content;
        updateLineNumbers(editor);
        renderFileList();
        if (autoRunCheckbox.checked) updatePreview();
      }
      updateTypingIndicatorUI(newValue.typingIndicator);
    } catch (e) {
      console.error('Error handling storage change:', e);
    }
  }
}

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

console.log('✅ CodX Editor loaded successfully!');
console.log('📋 Keyboard Shortcuts:');
console.log('  • Ctrl+S: Export project as ZIP');
console.log('  • Ctrl+Enter: Run code');
console.log('  • Ctrl+N: Create new file');
console.log('  • Ctrl+Shift+C: Toggle console');
console.log('  • Tab: Insert 2 spaces');
console.log('🎉 Ready to code!');