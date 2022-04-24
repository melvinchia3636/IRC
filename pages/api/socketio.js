/* eslint-disable no-param-reassign */
/* eslint-disable no-new-wrappers */
/* eslint-disable no-console */
import { Server } from 'socket.io';
import uuidv4 from '../../misc/uuidv4';

let users = [];

const removeUser = (uuid) => {
  const index = users.findIndex((u) => u.uuid === uuid);
  users = users.filter((u, i) => i !== index);
};

const ioHandler = (req, res) => {
  if (!res.socket.server.io) {
    console.log('*First use, starting socket.io');

    const io = new Server(res.socket.server);

    io.on('connection', (socket) => {
      let user = 'anonymous';
      let username = 'Anonymous';
      let uuid;

      socket.on('message', (msg, id, ip, date, replyTo) => {
        io.emit('message', msg, id, ip, date, username, replyTo);
      });

      socket.on('connected', (ip, nickname, userid) => {
        user = ip;
        username = nickname;
        uuid = userid;

        users.push(
          {
            user,
            username,
            uuid,
          },
        );

        io.emit('onlineUser', users);
        io.emit(
          'message',
          `${nickname} [${ip}] joined the chat`,
          uuidv4(),
          'SYSTEM',
          new Number(new Date()) / 1000,
        );

        console.log(`${ip} joined the chat`);
      });

      socket.on('nickname', (nickname) => {
        username = nickname;
        users = users.map((u) => {
          if (u.user === user) {
            u.username = username;
          }
          return u;
        });

        io.emit('onlineUser', users);

        io.emit(
          'message',
          `[${user}] has set his nickname to ${nickname}`,
          uuidv4(),
          'SYSTEM',
          new Number(new Date()) / 1000,
        );
      });

      socket.on('disconnect', () => {
        io.emit(
          'message',
          `${username} [${user}] left the chat`,
          uuidv4(),
          'SYSTEM',
          new Number(new Date()) / 1000,
        );
        io.emit('stopTyping', user);
        removeUser(uuid);
        io.emit('onlineUser', users);
        console.log(`${user} left the chat`);
      });

      socket.on('typing', (ip, nickname) => {
        io.emit('typing', ip, nickname);
      });

      socket.on('stopTyping', (ip) => {
        io.emit('stopTyping', ip);
      });
    });

    res.socket.server.io = io;
  } else {
    console.log('socket.io already running');
  }
  res.end();
};

export const config = {
  api: {
    bodyParser: false,
  },
};

export default ioHandler;
