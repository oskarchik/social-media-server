const router = require('express').Router();
const { signInValidation, signUpValidation } = require('../utils/authValidator');
const { validateRequest } = require('../middlewares/requestValidator.middleware');
const { signUpPost, signInPost, signOutPost, checkSessionGet } = require('../controllers/auth.controller');

router.post('/signup', signUpValidation, validateRequest, signUpPost);

router.post('/signin', signInValidation, validateRequest, signInPost);

router.post('/signout', signOutPost);

router.get('/check-session', checkSessionGet);

module.exports = router;
