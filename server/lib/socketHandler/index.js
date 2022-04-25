/* eslint-disable no-param-reassign */
/* eslint-disable no-new-wrappers */
const uuidv4 = require('../utils/uuidv4');

const messageEvent = require('./events/message');
const connectedEvent = require('./events/connected');

let users = [];

const removeUser = (uuid) => {
  const index = users.findIndex((u) => u.uuid === uuid);
  users = users.filter((u, i) => i !== index);
};

module.exports = function socketHandler(socket) {
  const { io } = this;

  const user = {
    uuid: undefined,
  };

  socket.join('room1');

  socket.on('message', messageEvent.bind({ io }));
  socket.on('connected', connectedEvent.bind({ io, user, users }));

  socket.on('nickname', (nickname) => {
    users = users.map((u) => {
      if (u.uuid === user.uuid) {
        u.username = nickname;
      }
      return u;
    });

    io.to('room1').emit(
      'message',
      `[${users.filter((u) => u.uuid === user.uuid).pop().user}] has set his nickname to ${nickname}`,
      uuidv4(),
      'SYSTEM',
      new Number(new Date()) / 1000,
    );
  });

  socket.on('disconnect', () => {
    const u = users.filter((e) => e.uuid === user.uuid).pop();

    io.to('room1').emit(
      'message',
      `${u.username} [${u.user}] left the chat`,
      uuidv4(),
      'SYSTEM',
      new Number(new Date()) / 1000,
    );
    io.to('room1').emit('stopTyping', u.user);
    removeUser(user.uuid);
    io.to('room1').emit('onlineUser', users);
    console.log(`${u.user} left the chat`);
  });

  // when user start typing
  socket.on('typing', (ip, nickname) => {
    io.to('room1').emit('typing', ip, nickname);
  });

  socket.on('stopTyping', (ip) => {
    io.to('room1').emit('stopTyping', ip);
  });
};
