const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const crypto = require('crypto');

// Database setup
const dbPath = path.join(__dirname, 'passwords.db');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS passwords (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    username TEXT NOT NULL,
    password TEXT NOT NULL
  )`);
});

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  mainWindow.loadFile('index.html');
  mainWindow.webContents.openDevTools();
}

// Handle saving a password
ipcMain.on('save-password', (event, { title, username, password }) => {
  // Encrypt the password
  const encryptedPassword = encryptPassword(password);

  const stmt = db.prepare('INSERT INTO passwords (title, username, password) VALUES (?, ?, ?)');
  stmt.run(title, username, encryptedPassword, (err) => {
    if (err) {
      console.error('Error saving password:', err);
    } else {
      console.log('Password saved successfully.');
    }
  });
  stmt.finalize();
});

// Handle loading passwords
ipcMain.on('load-passwords', (event) => {
  db.all('SELECT * FROM passwords', [], (err, rows) => {
    if (err) {
      console.error('Error fetching passwords:', err);
    } else {
      // Decrypt passwords
      const decryptedRows = rows.map(row => ({
        ...row,
        password: decryptPassword(row.password)
      }));
      event.sender.send('passwords', decryptedRows);
    }
  });
});

// Encrypt and decrypt functions
const algorithm = 'aes-256-cbc';
const key = crypto.randomBytes(32); // Use a securely stored key in practice
const iv = crypto.randomBytes(16);

function encryptPassword(password) {
  let cipher = crypto.createCipheriv(algorithm, Buffer.from(key), iv);
  let encrypted = cipher.update(password);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return JSON.stringify({ iv: iv.toString('hex'), encryptedData: encrypted.toString('hex') });
}

function decryptPassword(encrypted) {
  let { iv, encryptedData } = JSON.parse(encrypted);
  iv = Buffer.from(iv, 'hex');
  encryptedData = Buffer.from(encryptedData, 'hex');
  let decipher = crypto.createDecipheriv(algorithm, Buffer.from(key), iv);
  let decrypted = decipher.update(encryptedData);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
}

app.whenReady().then(() => {
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
