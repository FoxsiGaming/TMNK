const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const DB_FILE = process.env.DB_FILE || path.join(__dirname, '..', 'data', 'tmnk.sqlite3');
const DIR = path.dirname(DB_FILE);
if (!fs.existsSync(DIR)) fs.mkdirSync(DIR, { recursive: true });

const db = new sqlite3.Database(DB_FILE);

function transformSql(sql) {
  // Replace Postgres $1, $2... params with SQLite ? placeholders
  return sql.replace(/\$[0-9]+/g, '?').replace(/NOW\(\)/ig, "CURRENT_TIMESTAMP");
}

function query(sql, params = []) {
  const raw = sql;
  const s = transformSql(sql);
  const trimmed = s.trim();

  return new Promise((resolve, reject) => {
    // Multi-statement (migrations)
    if (s.includes(';') && !/^\s*SELECT/i.test(s)) {
      return db.exec(s, (err) => err ? reject(err) : resolve({ rows: [] }));
    }

    if (/^\s*SELECT/i.test(s)) {
      return db.all(s, params, (err, rows) => err ? reject(err) : resolve({ rows }));
    }

    db.run(s, params, function (err) {
      if (err) return reject(err);

      // Support simple RETURNING * emulation for INSERT/UPDATE used in the codebase
      if (/RETURNING\s+/i.test(raw)) {
        const insertMatch = /INSERT\s+INTO\s+([^(\s]+)/i.exec(raw);
        if (insertMatch) {
          const table = insertMatch[1];
          return db.get(`SELECT * FROM ${table} WHERE id = ?`, [this.lastID], (e, row) => e ? reject(e) : resolve({ rows: row ? [row] : [] }));
        }
        const updateMatch = /UPDATE\s+([^\s]+)\s+SET/i.exec(raw);
        if (updateMatch) {
          const table = updateMatch[1];
          const idVal = params[params.length - 1];
          return db.get(`SELECT * FROM ${table} WHERE id = ?`, [idVal], (e, row) => e ? reject(e) : resolve({ rows: row ? [row] : [] }));
        }
        return resolve({ rows: [] });
      }

      resolve({ rows: [], lastID: this.lastID, changes: this.changes });
    });
  });
}

function end() {
  return new Promise((resolve, reject) => db.close(err => err ? reject(err) : resolve()));
}

module.exports = { query, end, db };
