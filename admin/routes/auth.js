const router = require('express').Router();
const bcrypt = require('bcrypt');
const pool = require('../db/pool');
const path = require('path');

// Login page
router.get('/login', (req, res) => {
  if (req.session && req.session.userId) return res.redirect('/admin');
  res.sendFile(path.join(__dirname, '..', 'views', 'login.html'));
});

// Login handler
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const result = await pool.query('SELECT * FROM admin_users WHERE username = $1', [username]);
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const user = result.rows[0];
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    req.session.userId = user.id;
    req.session.username = user.username;
    res.json({ success: true, redirect: '/admin' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Logout
router.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.json({ success: true, redirect: '/auth/login' });
  });
});

module.exports = router;
