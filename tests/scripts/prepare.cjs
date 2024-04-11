const fs = require('fs');
const { execSync } = require('child_process');

fs.rmdirSync('dist/tests/db', { recursive: true });

fs.mkdirSync('tests/coverage/merged', { recursive: true });
fs.mkdirSync('dist/db', { recursive: true });
fs.mkdirSync('dist/tests/db', { recursive: true });
fs.mkdirSync('dist/tests/dir.db', { recursive: true });

fs.copyFileSync('db/base.db', 'dist/db.db');

fs.copyFileSync('db/base.db', 'dist/tests/db/2.2.db');

fs.readdirSync('tests/db').forEach(file => {
    fs.copyFileSync(`tests/db/${file}`, `dist/tests/db/${file}`);
});

fs.copyFileSync('dist/tests/db/2.2.db', 'dist/tests/db/unwriteable.db');

execSync('chmod 000 dist/tests/db/unwriteable.db');