require('dotenv').config();
const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const { connect } = require('./db');
const sockets = require('./socket/sockets');

connect();

const { app } = require('./app');
const httpServer = http.createServer(app);

const PORT = process.env.PORT || 5500;
const origin = process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : process.env.FRONT_URL;

const socketServer = socketIO(httpServer, {
  cors: {
    origin: process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : process.env.FRONT_URL,
    credentials: true,
    methods: ['GET', 'POST'],
  },
});

httpServer.listen(PORT, () => {
  console.log('fronturl', process?.env?.FRONT_URL);
  console.log(`running on http://localhost:${PORT}`);
});

sockets.listen(socketServer);
