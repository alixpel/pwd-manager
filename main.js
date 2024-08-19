const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const bcrypt = require('bcrypt');
const sqlite3 = require('sqlite3').verbose();
const crypto = require('crypto');
const fs = require('fs');

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

// Master password hash
let masterPasswordHash = '';
const saltRounds = 10;

// Load encryption key or generate it if it doesn't exist
const keyFilePath = path.join(__dirname, 'encryption.key');
let key;

if (fs.existsSync(keyFilePath)) {
  key = fs.readFileSync(keyFilePath);
} else {
  key = crypto.randomBytes(32);
  fs.writeFileSync(keyFilePath, key);
}

// Create main window
function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true,
      contextIsolation: true,
    },
  });

  mainWindow.loadFile('index.html');
  mainWindow.webContents.openDevTools();
}

// Handle setting the master password
ipcMain.on('set-master-password', (event, masterPassword) => {
  bcrypt.hash(masterPassword, saltRounds, (err, hash) => {
    if (err) {
      console.error('Error hashing master password:', err);
    } else {
      masterPasswordHash = hash;
      event.sender.send('auth-status', 'password-set');
    }
  });
});

// Handle verifying the master password
ipcMain.on('verify-master-password', (event, masterPassword) => {
  bcrypt.compare(masterPassword, masterPasswordHash, (err, result) => {
    if (err) {
      console.error('Error verifying master password:', err);
      event.sender.send('auth-status', 'error');
    } else if (result) {
      event.sender.send('auth-status', 'authenticated');
    } else {
      event.sender.send('auth-status', 'invalid');
    }
  });
});

// Handle saving a database password (not master)
ipcMain.on('save-password', (event, { title, username, password }) => {
  const encryptedPassword = encryptPassword(password);
  console.log('encrypted password : ', encryptedPassword);
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


// Handle loading passwords (Promise-based)
/*
ipcMain.handle('load-passwords', async (event) => {
  return new Promise((resolve, reject) => {
    db.all('SELECT * FROM passwords', [], (err, rows) => {
      if (err) {
        console.error('Error fetching passwords:', err);
        reject(err);
      } else {
        const decryptedRows = rows.map(row => ({
          ...row,
          password: decryptPassword(row.password)
        }));
        resolve(decryptedRows);
      }
    });
  });
});
*/
// testing :
/*
ipcMain.handle('load-passwords', async (event) => {
  return new Promise((resolve, reject) => {
    db.all('SELECT * FROM passwords', [], (err, rows) => {
      if (err) {
        console.error('Error fetching passwords:', err);
        reject(err);
      } else {
        // Directly resolve rows without decryption
        resolve(rows);
      }
    });
  });
});
*/
// more testing :
ipcMain.handle('load-passwords', async (event) => {
  return new Promise((resolve, reject) => {
    db.all('SELECT * FROM passwords', [], (err, rows) => {
      if (err) {
        console.error('Error fetching passwords:', err);
        reject(err);
      } else {
        const decryptedRows = rows.map(row => {
          const decryptedPassword = decryptPassword(row.password);
          console.log('Decrypted Password:', decryptedPassword); // Debug log
          return {
            ...row,
            password: decryptedPassword
          };
        });
        resolve(decryptedRows);
      }
    });
  });
});
// end of testing

// Encryption and decryption functions
const algorithm = 'aes-256-cbc';
const iv = crypto.randomBytes(16); // Generate a new IV for each encryption

/*
const algorithm = 'aes-256-cbc';
const iv = crypto.randomBytes(16);

function encryptPassword(password) {
  let cipher = crypto.createCipheriv(algorithm, key, iv);
  let encrypted = cipher.update(password);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return JSON.stringify({ iv: iv.toString('hex'), encryptedData: encrypted.toString('hex') });
}
  */
 // new encryption with try catch :
 function encryptPassword(password) {
  try {
    // const iv = crypto.randomBytes(16); // Generate a new IV for each encryption
    const cipher = crypto.createCipheriv(algorithm, key, iv);
    let encrypted = cipher.update(password);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return JSON.stringify({ iv: iv.toString('hex'), encryptedData: encrypted.toString('hex') });
  } catch (error) {
    console.error('Error encrypting password:', error);
    return null; // Return null or an appropriate value in case of encryption error
  }
}

/*
function decryptPassword(encrypted) {
  let { iv, encryptedData } = JSON.parse(encrypted);
  iv = Buffer.from(iv, 'hex');
  encryptedData = Buffer.from(encryptedData, 'hex');
  let decipher = crypto.createDecipheriv(algorithm, key, iv);
  let decrypted = decipher.update(encryptedData);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
}
*/
// new decryption test with try catch :
function decryptPassword(encrypted) {
  try {
    const { iv, encryptedData } = JSON.parse(encrypted);
    const ivBuffer = Buffer.from(iv, 'hex');
    const encryptedBuffer = Buffer.from(encryptedData, 'hex');
    const decipher = crypto.createDecipheriv(algorithm, key, ivBuffer);
    let decrypted = decipher.update(encryptedBuffer);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
  } catch (error) {
    console.error('Error decrypting password:', error);
    return null; // Return null or an appropriate value in case of decryption error
  }
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
