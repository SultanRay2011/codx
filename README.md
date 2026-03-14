# CodX Editor (Node.js + Socket.IO)

This project includes a Node.js backend (`server.js`) for real-time collaboration.

## Step-by-step: Upload this Node.js project to GitHub

1. Open terminal in this project folder:
```powershell
cd "c:\Users\HP\OneDrive\Desktop\Web Development\codxeditor"
```

2. Install dependencies (also ensures `package-lock.json` is correct):
```powershell
npm install
```

3. Create a `.gitignore` file (important for Node.js):
```gitignore
node_modules/
.env
npm-debug.log*
```

4. Initialize git (if not already initialized):
```powershell
git init
```

5. Add all files:
```powershell
git add .
```

6. Create first commit:
```powershell
git commit -m "Add CodX Editor with Node.js collaboration backend"
```

7. Create a new empty repository on GitHub (do not add README/license from GitHub UI).

8. Connect local repo to GitHub (replace placeholders):
```powershell
git branch -M main
git remote add origin https://github.com/<your-username>/<your-repo>.git
```

9. Push code to GitHub:
```powershell
git push -u origin main
```

10. Verify on GitHub that these files exist:
- `server.js`
- `package.json`
- `package-lock.json`
- `frontend.html`
- `frontend.js`
- `frontend.css`

## Run locally after upload

```powershell
npm install
npm start
```

Open:
```text
http://localhost:3000/frontend.html
```

## If port 3000 is busy

```powershell
$env:PORT=3001; npm start
```

Then open:
```text
http://localhost:3001/frontend.html
```
