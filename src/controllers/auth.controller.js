const passport = require('passport');
const bcrypt = require('bcrypt');
const User = require('../models/User');

const getUser = async (user) => {
  const userData = await User.findById(user._id)
    .populate({ path: 'contacts', populate: 'contacts' })
    .populate('posts')
    .populate('receivedRequests');
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

const signOutPost = (req, res, next) => {
  if (req.user) {
    req.logout();

    req.session.destroy(() => {
      res.clearCookie('connect.sid');

      return res.status(200).json({ message: 'Logout successful' });
    });
  } else {
    return res.status(401).json({ message: 'Unexpected error' });
  }
};

const checkSessionGet = async (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'No user found' });
  }
  try {
    const userData = await getUser(req.user);

    return res.status(200).json({ user: userData });
  } catch (error) {
    return res.json({ error: error });
  }
};

module.exports = {
  signUpPost,
  signInPost,
  signOutPost,
  checkSessionGet,
};
