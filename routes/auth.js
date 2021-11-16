const router = require('express').Router();
const { signUpPost, signInPost, signOutPost } = require('../controllers/auth.controller');

router.post('/signup', signUpPost);

router.post('/signin', signInPost);

router.post('/signout', signOutPost);

module.exports = router;
