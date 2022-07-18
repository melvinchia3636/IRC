/* eslint-disable no-new-wrappers */

const uuidv4 = require('../../utils/uuidv4');

/* eslint-disable no-undef */
module.exports = function disconnectEvent() {
  const {
    io, user, users, removeUser,
  } = this;

  const u = users.filter((e) => e.uuid === user.uuid).pop();

  io.emit(
    'message',
    `${u.username} [${u.user}] left the chat`,
    uuidv4(),
    'SYSTEM',
    new Number(new Date()) / 1000,
    null,
    'text',
    'general',
  );
  io.emit('stopTyping', u.user);
  removeUser(user.uuid);
  io.emit('onlineUser', users);
  console.log(`${u.user} left the chat`);
};
