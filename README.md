PWD Manager

``` text
pwd-manager/
├── .gitignore
├── node_modules/
├── package.json
├── package-lock.json
├── dbcleaner.js // for dev use
├── main.js
├── preload.js
├── renderer.js
├── index.html
└── assets/
    └── css/
        └── styles.css
```

Packages : 
Electron for app
SQLite for storage
/!\
npm install sqlite3
npm warn deprecated @npmcli/move-file@1.1.2: This functionality has been moved to @npmcli/fs
npm warn deprecated are-we-there-yet@3.0.1: This package is no longer supported.
npm warn deprecated inflight@1.0.6: This module is not supported, and leaks memory. Do not use it. Check out lru-cache if you want a good and tested 
way to coalesce async requests by a key value, which is much more comprehensive and powerful.
npm warn deprecated npmlog@6.0.2: This package is no longer supported.
npm warn deprecated rimraf@3.0.2: Rimraf versions prior to v4 are no longer supported
npm warn deprecated glob@7.2.3: Glob versions prior to v9 are no longer supported
npm warn deprecated gauge@4.0.4: This package is no longer supported.

With database.js.
=> modification of renderer.js to integrate the db 

Bcrypt for protecting the master password