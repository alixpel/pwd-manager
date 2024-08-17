const crypto = require('crypto');

document.getElementById('generate').addEventListener('click', () => {
  const password = generatePassword(16);
  document.getElementById('password').textContent = password;
});

function generatePassword(length) {
  return crypto.randomBytes(length).toString('base64').slice(0, length);
}
