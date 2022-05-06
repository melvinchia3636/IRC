module.exports = function typingEvent(uuid) {
  const { io, users } = this;
  const u = users.filter((e) => e.uuid === uuid).pop();

  if (u) {
    io.to(u.channel).emit('typing', u.user, u.username);
  }
};
