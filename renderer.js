// Password generator:
const crypto = require('crypto');

// Function to generate a random password
function generatePassword(length) {
  return crypto.randomBytes(length).toString('base64').slice(0, length);
}

// Handle password generation on button click
document.getElementById('generate').addEventListener('click', () => {
  const password = generatePassword(16);
  document.getElementById('password').textContent = password;
});

// Password storage and retrieval using IPC
const { ipcRenderer } = require('electron');

// Handle saving a password
document.getElementById('save').addEventListener('click', () => {
  const title = document.getElementById('title').value;
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').textContent;
  ipcRenderer.send('save-password', { title, username, password });
});

// Handle retrieving passwords
document.getElementById('load').addEventListener('click', () => {
  ipcRenderer.send('load-passwords');
});

// Update the UI with loaded passwords
ipcRenderer.on('passwords', (event, passwords) => {
  const passwordList = document.getElementById('password-list');
  passwordList.innerHTML = '';
  passwords.forEach(password => {
    const item = document.createElement('div');
    item.textContent = `${password.title}: ${password.username} - ${password.password}`;
    passwordList.appendChild(item);
  });
});

// Master password functionality :
const bcrypt = require('bcrypt');
const saltRounds = 10;

let masterPasswordHash = '';

function setMasterPassword(masterPassword) {
  bcrypt.hash(masterPassword, saltRounds, (err, hash) => {
    if (err) {
      console.error('Error hashing master password:', err);
    } else {
      masterPasswordHash = hash;
      console.log('Master password set successfully.');
    }
  });
}

function verifyMasterPassword(masterPassword, callback) {
  bcrypt.compare(masterPassword, masterPasswordHash, (err, result) => {
    if (err) {
      console.error('Error verifying master password:', err);
    } else {
      callback(result);
    }
  });
}
