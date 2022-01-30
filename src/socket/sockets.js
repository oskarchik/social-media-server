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

const listen = (io) => {
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
};

module.exports = {
  listen,
};
