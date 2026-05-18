const router = require('express').Router();
const path = require('path');

// Serve the public site
router.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', '..', 'index.html'));
});

module.exports = router;
