require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const pool = require('./pool');

const SQL = `
-- Lightweight SQLite schema for TMNK admin
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS session (
  sid TEXT PRIMARY KEY,
  sess TEXT NOT NULL,
  expire DATETIME NOT NULL
);
CREATE INDEX IF NOT EXISTS IDX_session_expire ON session (expire);

CREATE TABLE IF NOT EXISTS admin_users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS members (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  age INTEGER,
  role_et TEXT DEFAULT 'Liige',
  role_en TEXT DEFAULT 'Member',
  photo TEXT,
  link TEXT,
  sort_order INTEGER DEFAULT 0,
  visible INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS projects (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  icon TEXT,
  title_et TEXT NOT NULL,
  title_en TEXT,
  desc_et TEXT,
  desc_en TEXT,
  tag_et TEXT,
  tag_en TEXT,
  sort_order INTEGER DEFAULT 0,
  visible INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS gallery (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  image TEXT,
  emoji TEXT,
  gradient TEXT,
  title_et TEXT NOT NULL,
  title_en TEXT,
  desc_et TEXT,
  desc_en TEXT,
  tag_et TEXT,
  tag_en TEXT,
  sort_order INTEGER DEFAULT 0,
  visible INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  event_date DATE NOT NULL,
  title_et TEXT NOT NULL,
  title_en TEXT,
  desc_et TEXT,
  desc_en TEXT,
  tag_et TEXT,
  tag_en TEXT,
  location_et TEXT,
  location_en TEXT,
  time_text TEXT,
  visible INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS site_settings (
  key TEXT PRIMARY KEY,
  value_et TEXT,
  value_en TEXT,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
`;

async function migrate() {
  try {
    await pool.query(SQL);
    console.log('Migration complete — all tables created.');
  } catch (err) {
    console.error('Migration failed:', err.message);
  } finally {
    await pool.end();
  }
}

migrate();
