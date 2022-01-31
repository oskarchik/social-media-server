const { validationResult } = require('express-validator');
const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log('errors', errors);
    return res.status(400).json({ error: errors.array()[0] });
  }
  next();
};

module.exports = {
  validateRequest,
};
