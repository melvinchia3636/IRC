module.exports = function imageMessageEvent(msg, id, ip, date, username, replyTo) {
  this.io.to('room1').emit('message', msg, id, ip, date, username, replyTo, 'image');
};
