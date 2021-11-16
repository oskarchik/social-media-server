const router = require('express').Router();
const passport = require('passport');
const User = require('../models/User');
const bcrypt = require('bcrypt');

//TODO --- error messages need to be changed to more generic message

const getUser = async (user) => {
  const userData = await User.findById(user._id).populate('following').populate('posts');
  userData.password = null;
  return userData;
};

router.post('/signup', async (req, res, next) => {
  const { device, firstName, lastName, password, gender, dateOfBirth } = req.body;
  if (!device || !password) {
    return res.status(400).json({ error: 'some fields are required' });
  }

  passport.authenticate('register', (error, user) => {
    if (error) {
      return res.status(403).json({ error: error.message });
    }
    let userRegister = user;
    userRegister.password = null;

    return res.status(200).json({ user: userRegister });
  })(req, res, next);
});

router.post('/signin', async (req, res, next) => {
  passport.authenticate('login', (error, user) => {
    if (error) {
      return res.status(403).json({ error: error.message });
    }
    req.logIn(user, async (error) => {
      if (error) {
        return res.json({ error: error.message });
      }

      const userData = await getUser(user);

      return res.status(200).json({ user: userData });
    });
  })(req, res, next);
});

router.post('/signout', async (req, res, next) => {
  if (req.user) {
    req.logOut();
    req.session.destroy(() => {
      res.clearCookie('connect.sid');
    });
    return res.status(200).json({ message: 'Successful sing out' });
  } else {
    return res.status(401).json({ error: 'Unexpected error' });
  }
});
router.get('/', (req, res) => {
  res.send('hello from auth');
});

module.exports = router;
