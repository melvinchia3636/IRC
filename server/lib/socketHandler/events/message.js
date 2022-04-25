module.exports = function messageEvent(msg, id, ip, date, username, replyTo) {
  this.io.to('room1').emit('message', msg, id, ip, date, username, replyTo);
};
