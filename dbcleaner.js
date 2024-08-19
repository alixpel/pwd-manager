// passwordsHandler.js
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Database setup
const dbPath = path.join(__dirname, 'passwords.db');
const db = new sqlite3.Database(dbPath);

// Clear passwords function
function clearPasswords() {
  return new Promise((resolve, reject) => {
    db.run('DELETE FROM passwords', (err) => {
      if (err) {
        console.error('Error clearing passwords:', err);
        reject(err);
      } else {
        console.log('All passwords cleared.');
        resolve();
      }
    });
  });
}

// Run the function and handle the promise
clearPasswords()
  .then(() => {
    console.log('Operation completed successfully.');
    process.exit(0); // Exit the process successfully
  })
  .catch((err) => {
    console.error('Operation failed:', err);
    process.exit(1); // Exit the process with an error code
  });
