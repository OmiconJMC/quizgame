const express = require('express');
const { createServer } = require('node:http');
const { join } = require('node:path');
const { Server } = require('socket.io');

const app = express();
const server = createServer(app);
const io = new Server(server);

app.get('/', (req, res) => {
  res.sendFile(join(__dirname, 'index.html'));
});

io.on('connection', (socket) => {
  console.log('Player Connected');
});

server.listen(2763, () => {
  console.log('server running at http://localhost:2763');
});
io.on('connection', (socket) => {
  socket.on('serverstart', (msg) => {
    console.log('GameStart');
    io.emit("StartGame",'');
    setInterval(() => {
      console.log("tick");
      io.emit("tick",60);
    }, 1000);
  });
});