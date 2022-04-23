import { Server } from "socket.io";

let users = [];

const removeUser = (user) => {
  const index = users.indexOf(user);
  if (index !== -1) {
    users.splice(index, 1);
  }
}

const ioHandler = (req, res) => {
  if (!res.socket.server.io) {
    console.log("*First use, starting socket.io");

    const io = new Server(res.socket.server);

    io.on("connection", (socket) => {
      let user = "anonymous";
      let username = "Anonymous";

      socket.on("message", (msg, ip, date) => {
        io.emit("message", msg, ip, date, username);
      });

      socket.on("connected", (ip, nickname) => {
        user = ip;
        username = nickname;
        users.push(user);

        io.emit("onlineCount", users.length);
        io.emit(
          "message",
          `${nickname} [${ip}] joined the chat`,
          "SYSTEM",
          new Number(new Date()) / 1000
        );

        console.log(`${ip} joined the chat`);
      });

      socket.on("nickname", (nickname) => {
        username = nickname;
        io.emit(
          "message",
          `[${user}] has set his nickname to ${nickname}`,
          "SYSTEM",
          new Number(new Date()) / 1000
        );
      });

      socket.on("disconnect", () => {
        io.emit(
          "message",
          `${username} [${user}] left the chat`,
          "SYSTEM",
          new Number(new Date()) / 1000
        );
        io.emit("stopTyping", user);
        removeUser(user);
        io.emit("onlineCount", users.length);
        console.log(`${user} left the chat`);
      });

      socket.on("typing", (ip, nickname) => {
        io.emit("typing", ip, nickname);
      });

      socket.on("stopTyping", (ip) => {
        io.emit("stopTyping", ip);
      });
    });

    res.socket.server.io = io;
  } else {
    console.log("socket.io already running");
  }
  res.end();
};

export const config = {
  api: {
    bodyParser: false,
  },
};

export default ioHandler;
