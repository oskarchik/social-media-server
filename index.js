require('dotenv').config();
const express = require('express');

const app = express();
const morgan = require('morgan');
const helmet = require('helmet');

const connect = require('./db');
connect();

const usersRoute = require('./routes/users');
const authRoute = require('./routes/auth');
const PORT = process.env.PORT;

app.use(express.json());
app.use(helmet());
app.use(morgan('common'));

app.use('/api/users', usersRoute);
app.use('/api/auth', authRoute);

app.listen(PORT, () => {
  console.log(`running on http://localhost:${PORT}`);
});
