/* eslint-disable no-console */
const uuidv4 = require('../../utils/uuidv4');

/* eslint-disable no-new-wrappers */
module.exports = function connectedEvent(ip, nickname, userid) {
  const {
    io, user, users, channels,
  } = this;

  users.push({
    user: ip,
    username: nickname,
    uuid: userid,
    channel: channels[0],
  });

  user.uuid = userid;

  io.emit('onlineUser', users);
  io.emit('listChannels', channels);
  io.emit(
    'message',
    `[${ip}] joined the chat`,
    uuidv4(),
    'SYSTEM',
    new Number(new Date()) / 1000,
    null,
    'text',
    'general',
  );

  console.log(`${ip} joined the chat`);
};
