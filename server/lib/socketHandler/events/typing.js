module.exports = function typingEvent(uuid) {
  const { io, users } = this;
  const u = users.filter((e) => e.uuid === uuid).pop();

  if (u) {
    io.emit('typing', u.user, u.username);
  }
};
