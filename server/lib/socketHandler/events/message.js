/* eslint-disable no-param-reassign */
/* eslint-disable no-shadow */
/* eslint-disable no-new-wrappers */
const uuidv4 = require('../../utils/uuidv4');

module.exports = function messageEvent(msg, id, ip, date) {
  const u = this.users.filter((e) => e.uuid === this.user.uuid).pop();

  const { io, user, users } = this;

  if (msg.startsWith('/nick ')) {
    const newNickname = msg.split(' ')[1];
    if (newNickname) {
      users.forEach((u) => {
        if (u.uuid === user.uuid) {
          u.username = newNickname;
        }
      });
      console.log(users);

      io.emit('onlineUser', users);
      io.emit(
        'message',
        `[${
          users.filter((u) => u.uuid === user.uuid).pop().user
        }] has set his nickname to ${newNickname}`,
        uuidv4(),
        'SYSTEM',
        new Number(new Date()) / 1000,
        null,
        'text',
        'general',
      );
      return;
    }
  }

  this.io.emit('message', msg, id, ip, date, u?.username || '', 'text', u?.channel);
};
