module.exports = function imageMessageEvent(msg, id, ip, date) {
  const u = this.users.filter((e) => e.uuid === this.user.uuid).pop();
  this.io.emit('message', msg, id, ip, date, u.username, 'image', u.channel);
};
