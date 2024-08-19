// Access the Electron API exposed via preload.js
//const electronAPI = window.electronAPI;
//const crypto = require('crypto');


// Password generator:

document.getElementById('generate').addEventListener('click', () => {
  const password = window.electronAPI.generatePassword(16);
  document.getElementById('password').textContent = password;
});

// Event listener for saving a password
document.getElementById('save').addEventListener('click', () => {
  const title = document.getElementById('title').value;
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').textContent;
  window.electronAPI.savePassword({ title, username, password });
});

// Event listener for loading passwords
document.getElementById('load').addEventListener('click', () => {
  window.electronAPI.loadPasswords().then((passwords) => {
    const passwordList = document.getElementById('password-list');
    passwordList.innerHTML = '';  // Clear previous passwords
    passwords.forEach(password => {
      const item = document.createElement('div');
      item.textContent = `${password.title}: ${password.username} - ${password.password}`;
      passwordList.appendChild(item);
    });
  }).catch(err => {
    console.error('Failed to load passwords:', err);
  });
});

// Master password management
document.getElementById('set-master-password').addEventListener('click', () => {
  const masterPassword = document.getElementById('master-password').value;
  window.electronAPI.setMasterPassword(masterPassword);
});

document.getElementById('login').addEventListener('click', () => {
  const masterPassword = document.getElementById('login-password').value;
  window.electronAPI.verifyMasterPassword(masterPassword);
});

window.electronAPI.onAuthStatus((event, status) => {
  if (status === 'authenticated') {
    document.getElementById('generator').style.display = 'block';
    document.getElementById('save').style.display = 'block';
    document.getElementById('list').style.display = 'block';
    document.getElementById('auth').style.display = 'none';
  } else if (status === 'password-set') {
    document.getElementById('login-status').textContent = 'Master password set successfully. Please log in.';
  } else {
    document.getElementById('login-status').textContent = 'Invalid master password. Please try again.';
  }
});
