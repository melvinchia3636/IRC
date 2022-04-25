const express = require('express');
const socket = require('socket.io');
const cors = require('cors');
const socketHandler = require('./lib/socketHandler');

const app = express();

app.use(cors());

const server = app.listen(process.env.PORT || 3001, () => console.log('Server running on port 3001'));

const io = socket(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

io.on('connection', socketHandler.bind({ io }));
