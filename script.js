let urlEntries = JSON.parse(localStorage.getItem('urlEntries') || '[]');
let characters = JSON.parse(localStorage.getItem('characters') || '[]');
let isDarkMode = localStorage.getItem('isDarkMode') === 'true';

// Initialize Theme
if (isDarkMode) {
  document.body.classList.add('dark-mode');
}

function toggleTheme() {
  isDarkMode = !isDarkMode;
  document.body.classList.toggle('dark-mode', isDarkMode);
  localStorage.setItem('isDarkMode', isDarkMode);
}

function saveToStorage() {
  localStorage.setItem('urlEntries', JSON.stringify(urlEntries));
  localStorage.setItem('characters', JSON.stringify(characters));
}

function addUrlEntry() {
  const title = document.getElementById('urlTitle').value;
  const url = document.getElementById('urlValue').value;
  if (!title || !url) return alert('タイトルとURLを入力してください');
  urlEntries.push({ title, url });
  document.getElementById('urlTitle').value = '';
  document.getElementById('urlValue').value = '';
  saveToStorage();
  renderUrlList();
}

function removeUrlEntry(index) {
  urlEntries.splice(index, 1);
  saveToStorage();
  renderUrlList();
}

function moveUrlEntry(index, direction) {
  if (direction === -1 && index > 0) {
    [urlEntries[index], urlEntries[index - 1]] = [urlEntries[index - 1], urlEntries[index]];
  } else if (direction === 1 && index < urlEntries.length - 1) {
    [urlEntries[index], urlEntries[index + 1]] = [urlEntries[index + 1], urlEntries[index]];
  }
  saveToStorage();
  renderUrlList();
}

function renderUrlList() {
  const list = document.getElementById('urlList');
  list.innerHTML = '';
  urlEntries.forEach((entry, index) => {
    const div = document.createElement('div');
    div.className = 'entry';
    div.innerHTML = `
      <div>
        <strong>${entry.title}</strong><br>
        <a href="${entry.url}" target="_blank">${entry.url}</a>
      </div>
      <div class="actions-right">
        <div>
            <button class="move-button" onclick="moveUrlEntry(${index}, -1)">↑</button>
            <button class="move-button" onclick="moveUrlEntry(${index}, 1)">↓</button>
        </div>
        <button class="remove-button" onclick="removeUrlEntry(${index})">消</button>
      </div>
    `;
    list.appendChild(div);
  });
  saveToStorage();
  renderCharList();
}

function toggleImageInput() {
  const mode = document.querySelector('input[name="imageType"]:checked').value;
  const fileInput = document.getElementById('charImageFile');
  const urlInput = document.getElementById('charIcon');

  if (mode === 'file') {
    fileInput.style.display = 'block';
    urlInput.style.display = 'none';
  } else if (mode === 'url') {
    fileInput.style.display = 'none';
    urlInput.style.display = 'block';
  } else {
    // none
    fileInput.style.display = 'none';
    urlInput.style.display = 'none';
  }
}

function addCharacter() {
  const name = document.getElementById('charName').value;
  const mode = document.querySelector('input[name="imageType"]:checked').value;
  const url = document.getElementById('charUrl').value;
  const json = document.getElementById('charJson').value;
  const note = document.getElementById('charNote').value;

  if (!name) return alert('キャラクター名は必須です');

  const processCharacter = (iconData) => {
    characters.push({ name, icon: iconData, url, json, note });
    document.getElementById('charName').value = '';
    document.getElementById('charImageFile').value = '';
    document.getElementById('charIcon').value = '';
    document.getElementById('charUrl').value = '';
    document.getElementById('charJson').value = '';
    document.getElementById('charNote').value = '';
    saveToStorage();
    renderCharList();
  };

  if (mode === 'file') {
    const imageFile = document.getElementById('charImageFile').files[0];
    if (imageFile) {
      const reader = new FileReader();
      reader.onload = (e) => {
        processCharacter(e.target.result);
      };
      reader.readAsDataURL(imageFile);
    } else {
      processCharacter(null);
    }
  } else if (mode === 'url') {
    const iconUrl = document.getElementById('charIcon').value;
    processCharacter(iconUrl);
  } else {
    // none
    processCharacter(null);
  }
}

function removeCharacter(index) {
  characters.splice(index, 1);
  saveToStorage();
  renderCharList();
}

function moveCharacter(index, direction) {
  if (direction === -1 && index > 0) {
    [characters[index], characters[index - 1]] = [characters[index - 1], characters[index]];
  } else if (direction === 1 && index < characters.length - 1) {
    [characters[index], characters[index + 1]] = [characters[index + 1], characters[index]];
  }
  saveToStorage();
  renderCharList();
}

function renderCharList() {
  const list = document.getElementById('charList');
  list.innerHTML = '';
  characters.forEach((char, index) => {
    const div = document.createElement('div');
    div.className = 'character';
    // Default icon if none provided
    const iconSrc = char.icon || 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==';

    div.innerHTML = `
      <div class="char-info">
        <div class="char-info-left">
          <img src="${iconSrc}" alt="icon" />
          ${char.url ? `<a class="char-url" href="${char.url}" target="_blank">URL</a>` : '<a class="char-url"></a>'}
        </div>
        <div class="char-info-content">
          <strong>${char.name}</strong>
          ${char.note ? `<div class="char-note">${char.note}</div>` : '<div class="char-note"></div>'}
          ${char.json ? `<button class="copy-button" data-json="${encodeURIComponent(char.json)}" onclick="copyJson(this)">コピーテキスト</button>` : ''}
        </div>
      </div>
      <div class="actions-right">
        <div>
            <button class="move-button" onclick="moveCharacter(${index}, -1)">↑</button>
            <button class="move-button" onclick="moveCharacter(${index}, 1)">↓</button>
        </div>
        <button class="remove-button" onclick="removeCharacter(${index})">消</button>
      </div>
    `;
    list.appendChild(div);
  });
}

function copyJson(button) {
  const encoded = button.getAttribute('data-json');
  const json = decodeURIComponent(encoded);
  navigator.clipboard.writeText(json).then(() => {
    alert('テキストをコピーしました！');
  });
}

function exportHtmlFullPage() {
  const urlList = document.getElementById('urlList').cloneNode(true);
  const charList = document.getElementById('charList').cloneNode(true);

  // Remove buttons from the cloned lists
  urlList.querySelectorAll('button').forEach(btn => {
    if (!btn.classList.contains('copy-button')) btn.remove();
  });

  // Clean up URL list
  urlList.querySelectorAll('.actions-right').forEach(el => el.remove());

  // Clean up Char list
  charList.querySelectorAll('.actions-right').forEach(el => el.remove());

  // CSS Content - Updated to match style.css
  const cssContent = `
:root {
  --bg-color: #ffffff;
  --text-color: #000000;
  --input-bg: #ffffff;
  --input-text: #000000;
  --border-color: #ccc;
  --button-color: #1976d2;
  --button-hover-bg: #1976d2;
  --button-hover-text: #ffffff;
  --remove-button-color: #d32f2f;
  --sub-text-color: #666;
  --note-text-color: #444;
}

body.dark-mode {
  --bg-color: #121212;
  --text-color: #e0e0e0;
  --input-bg: #333333;
  --input-text: #ffffff;
  --border-color: #555;
  --button-color: #90caf9;
  --button-hover-bg: #90caf9;
  --button-hover-text: #121212;
  --remove-button-color: #ef5350;
  --sub-text-color: #aaa;
  --note-text-color: #ccc;
}

body {
  font-family: sans-serif;
  max-width: 800px;
  margin: 2rem auto;
  padding: 1rem;
  background-color: var(--bg-color);
  color: var(--text-color);
  transition: background-color 0.3s, color 0.3s;
}

input, textarea {
  width: 100%;
  padding: 8px;
  margin: 2px 0;
  box-sizing: border-box;
  background-color: var(--input-bg);
  color: var(--input-text);
  border: 1px solid var(--border-color);
}

button {
  padding: 8px;
  margin-top: 6px;
  background-color: transparent;
  border: 2px solid var(--button-color);
  color: var(--button-color);
  border-radius: 9999px;
  font-weight: bold;
  cursor: pointer;
}

button:hover {
  background-color: var(--button-hover-bg);
  color: var(--button-hover-text);
}

button.copy-button {
  width: 100px;
  height: 30px;
  margin-top: 2px;
  border: 2px solid var(--button-color);
  color: var(--button-color);
  background-color: transparent;
  border-radius: 9999px;
  font-weight: bold;
  font-size: 0.85rem;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 0;
}

.section {
  margin-top: 2rem;
}

.entry, .character {
  border: 1px solid var(--border-color);
  padding: 10px;
  margin-top: 1rem;
  position: relative;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.character img {
  width: 100px;
  height: 100px;
  object-fit: contain;
  border-radius: 2px;
  margin-right: 8px;
  display: block;
  background-color: rgba(128, 128, 128, 0.1);
}

.char-url {
  font-size: 0.75rem;
  color: var(--sub-text-color);
  display: block;
  margin-top: 2px;
  text-align: center;
}

.char-note {
  font-size: 0.8rem;
  color: var(--note-text-color);
  margin-top: 4px;
  white-space: pre-wrap;
}

.char-info {
  display: flex;
  align-items: flex-start;
  flex: 1;
}

.char-info-left {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-right: 10px;
}

.char-info-content {
  flex: 1;
  min-width: 0;
}

.char-note:empty::before {
  content: "　";
  visibility: hidden;
  display: block;
  min-height: 1.2em;
}

.char-url:empty::before {
  content: "　";
  visibility: hidden;
  display: block;
  min-height: 0.9em;
}
  `;

  // Determine current theme state
  const bodyClass = document.body.classList.contains('dark-mode') ? 'dark-mode' : '';

  const htmlContent = `
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <title>保存されたメモ</title>
  <style>${cssContent}</style>
</head>
<body class="${bodyClass}">
  <h1>URLメモ & キャラクターリスト</h1>
  <div class="section">
    <h2>URLメモ</h2>
    <div id="urlList">${urlList.innerHTML}</div>
  </div>
  <div class="section">
    <h2>キャラクター登録</h2>
    <div id="charList">${charList.innerHTML}</div>
  </div>
  <script>
    function copyJson(button) {
      const encoded = button.getAttribute('data-json');
      const json = decodeURIComponent(encoded);
      navigator.clipboard.writeText(json).then(() => {
        alert('テキストをコピーしました！');
      });
    }
  <\/script>
</body>
</html>`;

  const blob = new Blob([htmlContent], { type: 'text/html' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'memo_export.html';
  a.click();
}


function exportFullTxt() {
  const data = {
    urlEntries,
    characters
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'text/plain' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'memo_data.txt';
  a.click();
}

function importFullTxt(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function (e) {
    try {
      const data = JSON.parse(e.target.result);
      urlEntries = data.urlEntries || [];
      characters = data.characters || [];
      saveToStorage();
      renderUrlList();
      renderCharList();
    } catch (err) {
      alert('読み込みに失敗しました。ファイル形式を確認してください。');
    }
  };
  reader.readAsText(file);
}

renderUrlList();
renderCharList();
// Initialize image input state
toggleImageInput();
