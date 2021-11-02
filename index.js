require('dotenv').config();
const express = require('express');

const app = express();
const morgan = require('morgan');
const helmet = require('helmet');

const db = require('./db');
db.connect();
const PORT = process.env.PORT;

app.listen(PORT, () => {
  console.log(`running on http://localhost:${PORT}`);
});
