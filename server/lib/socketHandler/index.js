/* eslint-disable no-param-reassign */
/* eslint-disable no-new-wrappers */
const messageEvent = require('./events/message');
const imageMessageEvent = require('./events/imageMessage');
const connectedEvent = require('./events/connected');
const nicknameChangeEvent = require('./events/nicknameChange');
const disconnectEvent = require('./events/disconnect');
const typingEvent = require('./events/typing');

const users = [];
const channels = [
  'general',
  'announcements',
];

const removeUser = (uuid) => {
  const index = users.findIndex((u) => u.uuid === uuid);
  users.splice(index, 1);
};

module.exports = function socketHandler(socket) {
  const { io } = this;

  const user = {
    uuid: undefined,
  };

  socket.join(channels[0]);

  socket.on('message', messageEvent.bind({ io, user, users }));
  socket.on('imageMessage', imageMessageEvent.bind({ io, user, users }));
  socket.on('connected', connectedEvent.bind({
    io, user, users, channels,
  }));
  socket.on('nickname', nicknameChangeEvent.bind({ io, user, users }));
  socket.on('disconnect', disconnectEvent.bind({
    io, user, users, removeUser,
  }));
  socket.on('typing', typingEvent.bind({ io, users }));
  socket.on('stopTyping', (ip) => {
    io.emit('stopTyping', ip);
  });
  socket.on('changeChannel', (channel) => {
    socket.leave(users.filter((e) => e.uuid === user.uuid)[0].channel);
    users.filter((e) => e.uuid === user.uuid)[0].channel = channel;
    socket.join(channel);
  });
};
