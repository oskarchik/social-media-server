const isAuthenticated = (req, res, next) => {
  if (!req.isAuthenticated()) {
    return res.status(403).json({ error: 'no user' });
  }

  return next();
};
