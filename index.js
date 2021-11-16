require('dotenv').config();
const express = require('express');

const app = express();
const morgan = require('morgan');
const helmet = require('helmet');
const cors = require('cors');
const passport = require('passport');
const session = require('express-session');
const MongoStore = require('connect-mongo');

const connect = require('./db');
connect();
require('./passport/passport');

const usersRoute = require('./routes/users');
const authRoute = require('./routes/auth');
const postsRoute = require('./routes/posts');
const { Store } = require('express-session');
const PORT = process.env.PORT;

app.use(express.json());
app.use(helmet());
app.use(morgan('common'));
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
  res.header('Access-Control-Allow-Credentials', true);
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});
app.use(
  cors({
    origin: ['http://localhost:3000'],
    credentials: true,
  })
);
app.use(
  session({
    secret: process.env.SECRET_SESSION,
    saveUnintialized: false,
    resave: false,
    sameSite: false,
    store: MongoStore.create({ mongoUrl: process.env.MONGO_URI }),
  })
);
app.use(passport.initialize());
app.use(passport.session());

app.use('/api/users', usersRoute);
app.use('/api/auth', authRoute);
app.use('/api/posts', postsRoute);

app.use('*', (req, res, next) => {
  const error = new Error('Route not found');
  error.status = 404;
  next(error);
});

app.use((err, req, res, next) => {
  return res.status(err.status || 500).json({ error: err.message || 'Unexpected error' });
});

app.listen(PORT, () => {
  console.log(`running on http://localhost:${PORT}`);
});
