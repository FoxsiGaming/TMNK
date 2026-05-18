require('dotenv').config();
const express = require('express');
const session = require('express-session');
const SQLiteStore = require('connect-sqlite3')(session);
const path = require('path');
const fs = require('fs');
const pool = require('./db/pool');

const app = express();
const PORT = process.env.PORT || 3000;

/* ── Middleware ─────────────────────────────────────────────── */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session store in PostgreSQL
app.use(session({
  // store sessions in a local SQLite file
  store: new SQLiteStore({ db: 'sessions.sqlite', dir: path.join(__dirname, 'data') }),
  secret: process.env.SESSION_SECRET || 'tmnk-dev-secret',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 24 * 60 * 60 * 1000 } // 24 hours
}));

// Static files
app.use('/admin/css', express.static(path.join(__dirname, 'public/css')));
app.use('/admin/js', express.static(path.join(__dirname, 'public/js')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Serve the public site (parent directory)
app.use('/profiles', express.static(path.join(__dirname, '..', 'profiles')));
app.use('/styles.css', express.static(path.join(__dirname, '..', 'styles.css')));
app.use('/script.js', express.static(path.join(__dirname, '..', 'script.js')));
app.use('/dynamic.js', express.static(path.join(__dirname, '..', 'dynamic.js')));

/* ── Routes ────────────────────────────────────────────────── */
const authRoutes = require('./routes/auth');
const apiRoutes = require('./routes/api');
const adminRoutes = require('./routes/admin');
const publicRoutes = require('./routes/public');

app.use('/auth', authRoutes);
app.use('/api', apiRoutes);
app.use('/admin', adminRoutes);
app.use('/', publicRoutes);

/* ── Start ─────────────────────────────────────────────────── */
app.listen(PORT, () => {
  console.log('TMNK server running at http://localhost:' + PORT);
  console.log('Admin panel: http://localhost:' + PORT + '/admin');
});
