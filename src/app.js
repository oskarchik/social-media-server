const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const passport = require('passport');
const session = require('express-session');
const MongoStore = require('connect-mongo');
require('./passport/passport');

const app = express();
const { DB_URL } = require('./db');

const usersRoute = require('./routes/users');
const authRoute = require('./routes/auth');
const postsRoute = require('./routes/posts');
const commentsRoute = require('./routes/comments');
const conversationsRoute = require('./routes/conversations');
const messagesRoute = require('./routes/messages');
const isAuthenticated = require('./middlewares/auth.middleware');

const cookieOptions = {
  maxAge: 24 * 60 * 60 * 1000,
  httpOnly: true,
  secure: process.env.NODE_ENV === 'development' ? false : true,
  sameSite: process.env.NODE_ENV === 'development' ? 'lax' : 'none',
};
const origin = process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : process.env.FRONT_URL;

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
  res.header('Access-Control-Allow-Credentials', true);
  // res.header('Access-Control')
  next();
});

app.use(
  cors({
    origin: ['http://localhost:3000', 'https://social-face.netlify.app'],
    credentials: true,
  })
);

console.log('process', process.env.FRONT_URL);
console.log(cookieOptions);

app.use(helmet());
app.use(morgan('common'));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.set('trust proxy', 1);

app.use(
  session({
    secret: process.env.SECRET_SESSION,
    resave: false,
    saveUninitialized: false,
    cookie: cookieOptions,
    store: MongoStore.create({ mongoUrl: DB_URL }),
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.use('/api/users', isAuthenticated, usersRoute);
app.use('/api/auth', authRoute);
app.use('/api/posts', isAuthenticated, postsRoute);
app.use('/api/comments', isAuthenticated, commentsRoute);
app.use('/api/conversations', isAuthenticated, conversationsRoute);
app.use('/api/messages', isAuthenticated, messagesRoute);

app.use('*', (req, res, next) => {
  const error = new Error('Route not found');
  error.status = 404;
  next(error);
});

app.use((err, req, res, next) => {
  return res.status(err.status || 500).json({ error: err.message || 'Unexpected error' });
});

module.exports = { app };
