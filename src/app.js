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

const cookieOptions = {
  maxAge: 24 * 60 * 60 * 1000,
  httpOnly: true,
  secure: process.env.NODE_ENV === 'development' ? false : true,
  sameSite: process.env.NODE_ENV === 'development' ? 'lax' : 'none',
};

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
  res.header('Access-Control-Allow-Credentials', true);
  next();
});

app.use(
  cors({
    origin: [process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : process.env.FRONT_URL],
    credentials: true,
  })
);

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

app.use('/api/users', usersRoute);
app.use('/api/auth', authRoute);
app.use('/api/posts', postsRoute);
app.use('/api/comments', commentsRoute);
app.use('/api/conversations', conversationsRoute);
app.use('/api/messages', messagesRoute);

app.use('*', (req, res, next) => {
  const error = new Error('Route not found');
  error.status = 404;
  next(error);
});

app.use((err, req, res, next) => {
  return res.status(err.status || 500).json({ error: err.message || 'Unexpected error' });
});

module.exports = { app };
