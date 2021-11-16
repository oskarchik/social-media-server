const passport = require('passport');
const bcrypt = require('bcrypt');
const User = require('../models/User');

//TODO --- error messages need to be changed to more generic message

const getUser = async (user) => {
  const userData = await User.findById(user._id).populate('following').populate('posts');
  userData.password = null;
  return userData;
};

const signUpPost = async (req, res, next) => {
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
};

const signInPost = async (req, res, next) => {
  console.log(req.session);
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
};

const signOutPost = async (req, res, next) => {
  if (req.user) {
    req.logOut();
    req.session.destroy(() => {
      res.clearCookie('connect.sid');
    });
    return res.status(200).json({ message: 'Successful sing out' });
  } else {
    return res.status(401).json({ error: 'Unexpected error' });
  }
};

module.exports = {
  signUpPost,
  signInPost,
  signOutPost,
};
