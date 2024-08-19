const { contextBridge, ipcRenderer } = require('electron');
const crypto = require('crypto');

// Expose an API to the renderer process
contextBridge.exposeInMainWorld('electronAPI', {
  generatePassword: (length) => crypto.randomBytes(length).toString('base64').slice(0, length),
  savePassword: (data) => ipcRenderer.send('save-password', data),
  loadPasswords: () => ipcRenderer.invoke('load-passwords'),
  updatePassword: (passwordData) => ipcRenderer.invoke('update-password', passwordData),
  setMasterPassword: (password) => ipcRenderer.send('set-master-password', password),
  verifyMasterPassword: (password) => ipcRenderer.send('verify-master-password', password),
  onAuthStatus: (callback) => ipcRenderer.on('auth-status', callback),
  onPasswordsLoaded: (callback) => ipcRenderer.on('passwords', callback),
});
