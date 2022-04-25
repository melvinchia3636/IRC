const uuidv4 = require('../../utils/uuidv4');

/* eslint-disable no-new-wrappers */
module.exports = function connectedEvent(ip, nickname, userid) {
  const { io, user, users } = this;

  users.push({
    user: ip,
    username: nickname,
    uuid: userid,
  });

  user.uuid = userid;

  io.to('room1').emit('onlineUser', users);
  io.to('room1').emit(
    'message',
    `${nickname} [${ip}] joined the chat`,
    uuidv4(),
    'SYSTEM',
    new Number(new Date()) / 1000,
  );

  console.log(`${ip} joined the chat`);
};
