module.exports = function messageEvent(msg, id, ip, date, username, replyTo) {
  const u = this.users.filter((e) => e.uuid === this.user.uuid).pop();
  this.io.to(u.channel).emit('message', msg, id, ip, date, username, replyTo);
};
