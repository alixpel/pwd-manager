// Access the Electron API exposed via preload.js
//const electronAPI = window.electronAPI;
//const crypto = require('crypto');

////////////////////////////
// PASSWORDS - not master //
////////////////////////////

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
  // Check if any field is missing
  if (title && username && password) {
    window.electronAPI.savePassword({ title, username, password });
  } else {
    console.error(`Cannot save. Missing title ${title}, username ${username}, or password ${password}.`);
  }
});


// Load and display passwords
document.getElementById('load').addEventListener('click', () => {
  window.electronAPI.loadPasswords()
    .then((passwords) => {
      const passwordList = document.getElementById('password-list');
      passwordList.innerHTML = ''; // Clear previous content

      passwords.forEach(password => {
        // Only create the div if the password object is fully populated
        if (password.title && password.username && password.password) {
          const item = document.createElement('div');
          item.classList.add('password-item');
          // Password details
          const details = document.createElement('span');
          details.textContent = `${password.title}: ${password.username} - ${password.password}`;
          item.appendChild(details);
          // Edit button
          const editButton = document.createElement('button');
          editButton.textContent = 'Edit';
          editButton.addEventListener('click', () => editPassword(password));
          item.appendChild(editButton);
          // Delete button
          const deleteButton = document.createElement('button');
          deleteButton.textContent = 'Delete password';
          deleteButton.addEventListener('click', () => deletePassword(password.id));
          item.appendChild(deleteButton);
          passwordList.appendChild(item);
          console.log("no missing elements");
        } else {
          console.log("missing elements");
        }
      });

      document.getElementById('edit').style.display = 'none';
      document.getElementById('list').style.display = 'block';
    })
    .catch(err => {
      console.error('Failed to load passwords:', err);
    });
});


// Edit password function
function editPassword(password) {
  document.getElementById('edit-id').value = password.id;
  document.getElementById('edit-title').value = password.title;
  document.getElementById('edit-username').value = password.username;
  document.getElementById('edit-password').value = password.password;
  document.getElementById('list').style.display = 'none';
  document.getElementById('edit').style.display = 'block';
}

// Update password
document.getElementById('update-password').addEventListener('click', () => {
  const id = document.getElementById('edit-id').value;
  const title = document.getElementById('edit-title').value;
  const username = document.getElementById('edit-username').value;
  const password = document.getElementById('edit-password').value;

  window.electronAPI.updatePassword({ id, title, username, password })
      .then(() => {
          alert('Password updated successfully');
          document.getElementById('edit').style.display = 'none';
          document.getElementById('list').style.display = 'block';
          document.getElementById('load').click(); // Reload the password list
      })
      .catch(err => {
          console.error('Failed to update password:', err);
      });
});

// Cancel editing
document.getElementById('cancel-edit').addEventListener('click', () => {
  document.getElementById('edit').style.display = 'none';
  document.getElementById('list').style.display = 'block';
});

// Function to delete a password
function deletePassword(id) {
  if (confirm('Are you sure you want to delete this password?')) {
    window.electronAPI.deletePassword(id)
      .then(() => {
        // Reload passwords after deletion
        document.getElementById('load').click();
      })
      .catch(err => {
        console.error('Failed to delete password:', err);
      });
  }
}

/////////////////////
// MASTER PASSWORD //
/////////////////////

// Master password management
document.getElementById('set-master-password').addEventListener('click', () => {
  const masterPassword = document.getElementById('master-password').value;
  window.electronAPI.setMasterPassword(masterPassword);
  console.log("master password was set : ", masterPassword);
});

document.getElementById('login').addEventListener('click', () => {
  const masterPassword = document.getElementById('login-password').value;
  window.electronAPI.verifyMasterPassword(masterPassword);
  console.log("login password was verified");
});

window.electronAPI.onAuthStatus((event, status) => {
  if (status === 'authenticated') {
    console.log("status : authenticated");
    document.getElementById('generator').style.display = 'block';
    document.getElementById('saving').style.display = 'block';
    document.getElementById('list').style.display = 'block';
    document.getElementById('auth').style.display = 'none';
  } else if (status === 'password-set') {
    console.log("not authenticated");
    document.getElementById('login-status').textContent = 'Master password set successfully. Please log in.';
  } else {
    document.getElementById('login-status').textContent = 'Invalid master password. Please try again.';
  }
});
