const { body } = require('express-validator');

const signUpValidation = [
  body('device')
    .trim()
    .notEmpty()
    .matches(/^([a-zA-Z0-9_\-\.]+)@([a-zA-Z0-9_\-\.]+)\.([a-zA-Z]{2,5})$|^\+[1-9]{1}[0-9]{3,14}$/),
  body('firstName').trim().isLength({ min: 2, max: 15 }),
  body('lastName').trim().isLength({ min: 2, max: 15 }),
  body('password').trim().notEmpty().isLength({ min: 4 }),
  body('dateOfBirth')
    .trim()
    .notEmpty()
    .custom((dateOfBirth) => {
      const today = new Date();
      const DOB = new Date(dateOfBirth);
      if ((today - DOB) / 1000 / 60 / 60 / 24 / 365.3 < 18) {
        throw new Error('Invalid date of birth');
      }
      return true;
    }),
];

const signInValidation = [
  body('device')
    .trim()
    .notEmpty()
    .matches(/^([a-zA-Z0-9_\-\.]+)@([a-zA-Z0-9_\-\.]+)\.([a-zA-Z]{2,5})$|^\+[1-9]{1}[0-9]{3,14}$/),
  body('password').trim().notEmpty().isLength({ min: 4 }),
];

module.exports = {
  signUpValidation,
  signInValidation,
};
