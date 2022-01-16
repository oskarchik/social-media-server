const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');

const saltRounds = 10;

const User = require('../models/User');

passport.serializeUser((user, done) => done(null, user._id));

passport.deserializeUser(async (userId, done) => {
  try {
    const existingUser = await User.findById(userId);
    return done(null, existingUser);
  } catch (error) {
    return done(error);
  }
});

passport.use(
  'register',
  new LocalStrategy(
    {
      usernameField: 'device',
      passwordField: 'password',
      passReqToCallback: true,
    },
    async (req, device, password, done) => {
      const { firstName, lastName, dateOfBirth, gender } = req.body;

      try {
        const previousUser = await User.findOne({ device });

        if (previousUser) {
          const error = new Error('User already exists');
          return done(error);
        }
        const hash = await bcrypt.hash(password, saltRounds);
        const newUser = new User({
          firstName,
          lastName,
          dateOfBirth,
          gender,
          device,
          password: hash,
        });

        const savedUser = await newUser.save();
        return done(null, savedUser);
      } catch (error) {
        return done(error);
      }
    }
  )
);

passport.use(
  'login',
  new LocalStrategy(
    {
      usernameField: 'device',
      passwordField: 'password',
      passReqToCallback: true,
    },
    async (req, device, password, done) => {
      try {
        const currentUser = await User.findOne({ device });
        if (!currentUser) {
          const error = new Error('The user does not exist');
          return done(error);
        }
        const isValidPassword = await bcrypt.compare(password, currentUser.password);

        if (!isValidPassword) {
          const error = new Error('Invalid password');
          return done(error);
        }
        return done(null, currentUser);
      } catch (error) {
        return done(error);
      }
    }
  )
);
