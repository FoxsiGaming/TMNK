const router = require('express').Router();
const path = require('path');
const { requireAuth } = require('../middleware/auth');

router.get('/', requireAuth, (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'views', 'admin.html'));
});

module.exports = router;
