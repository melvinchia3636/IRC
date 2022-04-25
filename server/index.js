const express = require("express");
const socket = require("socket.io");
const cors = require("cors");

function uuidv4() {
  // Public Domain/MIT
  let d = new Date().getTime(); // Timestamp
  let d2 = (typeof performance !== 'undefined'
      && performance.now
      && performance.now() * 1000)
    || 0; // Time in microseconds since page-load or 0 if unsupported
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    let r = Math.random() * 16; // random number between 0 and 16
    if (d > 0) {
      // Use timestamp until depleted
      r = (d + r) % 16 | 0;
      d = Math.floor(d / 16);
    } else {
      // Use microseconds since page-load if supported
      r = (d2 + r) % 16 | 0;
      d2 = Math.floor(d2 / 16);
    }
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
};


const app = express();

app.use(cors());

let users = [];

const removeUser = (uuid) => {
  const index = users.findIndex((u) => u.uuid === uuid);
  users = users.filter((u, i) => i !== index);
};

const server = app.listen(process.env.PORT || 3001, () =>
  console.log("Server running on port 3001")
);

const io = socket(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true
  }
});

io.on('connection', (socket) => {
  socket.join('room1');

  let user = 'anonymous';
  let username = 'Anonymous';
  let uuid;

  socket.on('message', (msg, id, ip, date, replyTo) => {
    io.to('room1').emit('message', msg, id, ip, date, username, replyTo);
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

    io.to('room1').emit('onlineUser', users);
    io.to('room1').emit(
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

    io.to('room1').emit(
      'message',
      `[${user}] has set his nickname to ${nickname}`,
      uuidv4(),
      'SYSTEM',
      new Number(new Date()) / 1000,
    );
  });

  socket.on('disconnect', () => {
    io.to('room1').emit(
      'message',
      `${username} [${user}] left the chat`,
      uuidv4(),
      'SYSTEM',
      new Number(new Date()) / 1000,
    );
    io.to('room1').emit('stopTyping', user);
    removeUser(uuid);
    io.to('room1').emit('onlineUser', users);
    console.log(`${user} left the chat`);
  });

  // when user start typing
  socket.on('typing', (ip, nickname) => {
    io.to('room1').emit('typing', ip, nickname);
  });

  socket.on('stopTyping', (ip) => {
    io.to('room1').emit('stopTyping', ip);
  });
});
