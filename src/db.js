const mongoose = require('mongoose');

const DB_URL = process.env.NODE_ENV === 'development' ? process.env.MONGO_URI_LOCAL : process.env.MONGO_URI;

const connect = async () => {
  try {
    mongoose.connect(DB_URL, {
      useNewUrlParser: true,
    });
    console.log('connected to database');
  } catch (error) {
    console.log('error connecting to database: ' + error);
  }
};

module.exports = { connect, DB_URL };
