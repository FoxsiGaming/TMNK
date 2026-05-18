function requireAuth(req, res, next) {
  if (req.session && req.session.userId) return next();
  // API requests get 401, page requests redirect to login
  if (req.path.startsWith('/api')) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  return res.redirect('/auth/login');
}

module.exports = { requireAuth };
