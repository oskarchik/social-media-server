require('dotenv').config();
const express = require('express');
const http = require('http');
const socketio = require('socket.io');
const morgan = require('morgan');
const helmet = require('helmet');
const cors = require('cors');
const passport = require('passport');
const session = require('express-session');
const MongoStore = require('connect-mongo');

const connect = require('./db');

const usersRoute = require('./routes/users');
const authRoute = require('./routes/auth');
const postsRoute = require('./routes/posts');
const commentsRoute = require('./routes/comments');
const conversationsRoute = require('./routes/conversations');
const messagesRoute = require('./routes/messages');

connect();
require('./passport/passport');
const app = express();
const server = http.createServer(app);
const io = socketio(server, {
  cors: {
    origin: '*',
    credentials: true,
  },
});

const PORT = process.env || 5500;

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
  res.header('Access-Control-Allow-Credentials', true);
  // res.header('Access-Control-Allow-Headers', ['Content-Type, multipart/form-data']);
  next();
});

app.use(helmet());
app.use(morgan('common'));

app.use(
  cors({
    origin: ['*'],
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  session({
    secret: process.env.SECRET_SESSION,
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 24 * 60 * 60 * 1000,
      httpOnly: true,
      secure: false,
    },
    store: MongoStore.create({ mongoUrl: process.env.MONGO_URI }),
  })
);
app.use(passport.initialize());
app.use(passport.session());

let users = [];

const addUser = (userId, socketId) => {
  if (!users.some((user) => user.userId === userId)) {
    users.push({ userId, socketId });
  }
};

const removeUser = (socketId) => {
  users = users.filter((user) => user.socketId !== socketId);
};

const getUser = (userId) => {
  return users.find((user) => user.userId === userId);
};
io.on('connection', (socket) => {
  // on connection
  console.log('new ws connection');

  socket.on('addUser', (userId) => {
    addUser(userId, socket.id);
    io.emit('getUsers', users);
  });

  // send and get messages
  socket.on('sendMessage', ({ senderId, receiverId, text }) => {
    const user = getUser(receiverId);

    io.to(user?.socketId).emit('getMessage', {
      senderId,
      text,
    });
  });

  //notifications

  socket.on('sendNotification', ({ senderId, receiverId, type }) => {
    const receiver = receiverId;
    io.to(receiver.socketId).emit('getNotification', {
      senderId,
      type,
    });
  });

  //on disconnection
  socket.on('disconnect', () => {
    console.log('a user disconnected');
    removeUser(socket.id);
    io.emit('getUsers', users);
  });
});

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

server.listen(process.env.PORT || 5500, () => {
  console.log(`running on http://localhost:${PORT}`);
});
