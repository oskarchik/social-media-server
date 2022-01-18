const mongoose = require('mongoose');

const connect = async () => {
  try {
    mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
    });
    console.log('connected to database');
  } catch (error) {
    console.log('error connecting to database: ' + error);
  }
};

module.exports = connect;
