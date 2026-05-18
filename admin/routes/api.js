const router = require('express').Router();
const pool = require('../db/pool');
const { requireAuth } = require('../middleware/auth');
const { createUploader } = require('../middleware/upload');
const fs = require('fs');
const path = require('path');

const profileUpload = createUploader('profiles');
const galleryUpload = createUploader('gallery');

/* ════════════════════════════════════════════════════════════
   PUBLIC API — no auth required (used by the public site)
   ════════════════════════════════════════════════════════════ */

router.get('/public/members', async (req, res) => {
  const { rows } = await pool.query('SELECT * FROM members WHERE visible=true ORDER BY sort_order');
  res.json(rows);
});

router.get('/public/projects', async (req, res) => {
  const { rows } = await pool.query('SELECT * FROM projects WHERE visible=true ORDER BY sort_order');
  res.json(rows);
});

router.get('/public/gallery', async (req, res) => {
  const { rows } = await pool.query('SELECT * FROM gallery WHERE visible=true ORDER BY sort_order');
  res.json(rows);
});

router.get('/public/events', async (req, res) => {
  const { rows } = await pool.query('SELECT * FROM events WHERE visible=true ORDER BY event_date');
  res.json(rows);
});

router.get('/public/settings', async (req, res) => {
  const { rows } = await pool.query('SELECT * FROM site_settings');
  const obj = {};
  rows.forEach(r => { obj[r.key] = { et: r.value_et, en: r.value_en }; });
  res.json(obj);
});

/* ════════════════════════════════════════════════════════════
   ADMIN API — auth required
   ════════════════════════════════════════════════════════════ */

// ── Members ───────────────────────────────────────────────
router.get('/members', requireAuth, async (req, res) => {
  const { rows } = await pool.query('SELECT * FROM members ORDER BY sort_order');
  res.json(rows);
});

router.post('/members', requireAuth, profileUpload.single('photo'), async (req, res) => {
  const { name, age, role_et, role_en, link, sort_order } = req.body;
  const photo = req.file ? '/uploads/profiles/' + req.file.filename : null;
  const { rows } = await pool.query(
    `INSERT INTO members (name, age, role_et, role_en, photo, link, sort_order)
     VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
    [name, age || null, role_et || 'Liige', role_en || 'Member', photo, link || '#', sort_order || 0]
  );
  res.json(rows[0]);
});

router.put('/members/:id', requireAuth, profileUpload.single('photo'), async (req, res) => {
  const { name, age, role_et, role_en, link, sort_order, visible } = req.body;
  let photo = req.body.existing_photo || null;
  if (req.file) photo = '/uploads/profiles/' + req.file.filename;
  const { rows } = await pool.query(
    `UPDATE members SET name=$1, age=$2, role_et=$3, role_en=$4, photo=$5, link=$6,
     sort_order=$7, visible=$8, updated_at=NOW() WHERE id=$9 RETURNING *`,
    [name, age || null, role_et, role_en, photo, link || '#', sort_order || 0, visible !== 'false', req.params.id]
  );
  res.json(rows[0]);
});

router.delete('/members/:id', requireAuth, async (req, res) => {
  await pool.query('DELETE FROM members WHERE id=$1', [req.params.id]);
  res.json({ success: true });
});

// ── Projects ──────────────────────────────────────────────
router.get('/projects', requireAuth, async (req, res) => {
  const { rows } = await pool.query('SELECT * FROM projects ORDER BY sort_order');
  res.json(rows);
});

router.post('/projects', requireAuth, async (req, res) => {
  const { icon, title_et, title_en, desc_et, desc_en, tag_et, tag_en, sort_order } = req.body;
  const { rows } = await pool.query(
    `INSERT INTO projects (icon, title_et, title_en, desc_et, desc_en, tag_et, tag_en, sort_order)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
    [icon, title_et, title_en, desc_et, desc_en, tag_et, tag_en, sort_order || 0]
  );
  res.json(rows[0]);
});

router.put('/projects/:id', requireAuth, async (req, res) => {
  const { icon, title_et, title_en, desc_et, desc_en, tag_et, tag_en, sort_order, visible } = req.body;
  const { rows } = await pool.query(
    `UPDATE projects SET icon=$1, title_et=$2, title_en=$3, desc_et=$4, desc_en=$5,
     tag_et=$6, tag_en=$7, sort_order=$8, visible=$9, updated_at=NOW() WHERE id=$10 RETURNING *`,
    [icon, title_et, title_en, desc_et, desc_en, tag_et, tag_en, sort_order || 0, visible !== false && visible !== 'false', req.params.id]
  );
  res.json(rows[0]);
});

router.delete('/projects/:id', requireAuth, async (req, res) => {
  await pool.query('DELETE FROM projects WHERE id=$1', [req.params.id]);
  res.json({ success: true });
});

// ── Gallery ───────────────────────────────────────────────
router.get('/gallery', requireAuth, async (req, res) => {
  const { rows } = await pool.query('SELECT * FROM gallery ORDER BY sort_order');
  res.json(rows);
});

router.post('/gallery', requireAuth, galleryUpload.single('image'), async (req, res) => {
  const { emoji, gradient, title_et, title_en, desc_et, desc_en, tag_et, tag_en, sort_order } = req.body;
  const image = req.file ? '/uploads/gallery/' + req.file.filename : null;
  const { rows } = await pool.query(
    `INSERT INTO gallery (image, emoji, gradient, title_et, title_en, desc_et, desc_en, tag_et, tag_en, sort_order)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`,
    [image, emoji, gradient, title_et, title_en, desc_et, desc_en, tag_et, tag_en, sort_order || 0]
  );
  res.json(rows[0]);
});

router.put('/gallery/:id', requireAuth, galleryUpload.single('image'), async (req, res) => {
  const { emoji, gradient, title_et, title_en, desc_et, desc_en, tag_et, tag_en, sort_order, visible } = req.body;
  let image = req.body.existing_image || null;
  if (req.file) image = '/uploads/gallery/' + req.file.filename;
  const { rows } = await pool.query(
    `UPDATE gallery SET image=$1, emoji=$2, gradient=$3, title_et=$4, title_en=$5, desc_et=$6, desc_en=$7,
     tag_et=$8, tag_en=$9, sort_order=$10, visible=$11, updated_at=NOW() WHERE id=$12 RETURNING *`,
    [image, emoji, gradient, title_et, title_en, desc_et, desc_en, tag_et, tag_en, sort_order || 0, visible !== false && visible !== 'false', req.params.id]
  );
  res.json(rows[0]);
});

router.delete('/gallery/:id', requireAuth, async (req, res) => {
  await pool.query('DELETE FROM gallery WHERE id=$1', [req.params.id]);
  res.json({ success: true });
});

// ── Events ────────────────────────────────────────────────
router.get('/events', requireAuth, async (req, res) => {
  const { rows } = await pool.query('SELECT * FROM events ORDER BY event_date');
  res.json(rows);
});

router.post('/events', requireAuth, async (req, res) => {
  const { event_date, title_et, title_en, desc_et, desc_en, tag_et, tag_en, location_et, location_en, time_text } = req.body;
  const { rows } = await pool.query(
    `INSERT INTO events (event_date, title_et, title_en, desc_et, desc_en, tag_et, tag_en, location_et, location_en, time_text)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`,
    [event_date, title_et, title_en, desc_et, desc_en, tag_et, tag_en, location_et, location_en, time_text]
  );
  res.json(rows[0]);
});

router.put('/events/:id', requireAuth, async (req, res) => {
  const { event_date, title_et, title_en, desc_et, desc_en, tag_et, tag_en, location_et, location_en, time_text, visible } = req.body;
  const { rows } = await pool.query(
    `UPDATE events SET event_date=$1, title_et=$2, title_en=$3, desc_et=$4, desc_en=$5,
     tag_et=$6, tag_en=$7, location_et=$8, location_en=$9, time_text=$10, visible=$11, updated_at=NOW()
     WHERE id=$12 RETURNING *`,
    [event_date, title_et, title_en, desc_et, desc_en, tag_et, tag_en, location_et, location_en, time_text, visible !== false && visible !== 'false', req.params.id]
  );
  res.json(rows[0]);
});

router.delete('/events/:id', requireAuth, async (req, res) => {
  await pool.query('DELETE FROM events WHERE id=$1', [req.params.id]);
  res.json({ success: true });
});

// ── Site Settings ─────────────────────────────────────────
router.get('/settings', requireAuth, async (req, res) => {
  const { rows } = await pool.query('SELECT * FROM site_settings ORDER BY key');
  res.json(rows);
});

router.put('/settings/:key', requireAuth, async (req, res) => {
  const { value_et, value_en } = req.body;
  const { rows } = await pool.query(
    `INSERT INTO site_settings (key, value_et, value_en) VALUES ($1,$2,$3)
     ON CONFLICT (key) DO UPDATE SET value_et=$2, value_en=$3, updated_at=NOW() RETURNING *`,
    [req.params.key, value_et, value_en]
  );
  res.json(rows[0]);
});

module.exports = router;
