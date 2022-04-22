const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
app.use(cors());
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
  }
});

io.on("connection", (socket) => {
  let user = "anonymous";

  socket.on("message", (msg, ip, date) => {
    io.emit("message", msg, ip, date);
  });

  socket.on("connected", (ip) => {
    io.emit("message", `[${ip}] joined the chat`, "SYSTEM", new Number(new Date()) / 1000);
    console.log(`${ip} joined the chat`);
    user = ip
  })

  socket.on("disconnect", () => {
    io.emit("message", `[${user}] left the chat`, "SYSTEM", new Number(new Date()) / 1000);
    console.log(`${user} left the chat`);
  })
});

server.listen(3001, () => {
  console.log("listening on *:3001");
});
