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

  io.to(channels[0]).emit('onlineUser', users);
  io.to(channels[0]).emit('listChannels', channels);
  io.to(channels[0]).emit(
    'message',
    `${nickname} [${ip}] joined the chat`,
    uuidv4(),
    'SYSTEM',
    new Number(new Date()) / 1000,
  );

  console.log(`${ip} joined the chat`);
};
