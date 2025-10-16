const fs = require('fs');
const path = require('path');

const dbPath = path.resolve(__dirname, 'db.json');

function readDb() {
  const db = fs.readFileSync(dbPath, 'utf-8');
  return JSON.parse(db);
}

module.exports = {
  db: readDb(),
};