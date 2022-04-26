/* eslint-disable no-new-wrappers */
const uuidv4 = require('../../utils/uuidv4');

/* eslint-disable no-param-reassign */
module.exports = function nicknameChangeEvent(nickname) {
  const { io, user, users } = this;

  users.forEach((u) => {
    if (u.uuid === user.uuid) {
      u.username = nickname;
    }
  });

  io.to('room1').emit(
    'message',
    `[${
      users.filter((u) => u.uuid === user.uuid).pop().user
    }] has set his nickname to ${nickname}`,
    uuidv4(),
    'SYSTEM',
    new Number(new Date()) / 1000,
  );
};
