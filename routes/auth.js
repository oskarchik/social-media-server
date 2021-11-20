const router = require('express').Router();
const { signUpPost, signInPost, signOutPost, checkSessionGet } = require('../controllers/auth.controller');

router.post('/signup', signUpPost);

router.post('/signin', signInPost);

router.post('/signout', signOutPost);

router.get('/check-session', checkSessionGet);

module.exports = router;
