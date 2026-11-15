const express = require('express');
const { Socket } = require('node:dgram');
const { createServer } = require('node:http');
const { join } = require('node:path');
const { Server } = require('socket.io');
const { _ } = require('lodash');

const app = express();
const server = createServer(app);
const io = new Server(server);

var questions=['return "type b;;b"','var num1=Math.ceil(Math.random()*10);var num2=Math.ceil(Math.random()*10);const a=num1+num2;return num1+"+"+num2+";;"+a'];

var timer=30;
var gamerunning=false;
var turn=1;
var playerlist=[];

var UNDB={};

app.get('/', (req, res) => {
  res.sendFile(join(__dirname, 'index.html'));
});


io.on('connection', (socket) => {
  console.log('Player Connected');
  playerlist.push(socket);
  UNDB[socket.id]="Player-"+socket.id;
  socket.on('disconnect',(reason)=>{
    playerlist=playerlist.filter(p=>p.id!==socket.id);
  console.log(playerlist.length);
  });
});

server.listen(2763, () => {
  console.log('server running at http://localhost:2763');
});
io.on('connection', (socket) => {
  socket.on("UN",(msg)=>{
    UNDB[socket.id]=msg;
  });
  socket.on('serverstart', (msg) => {
    console.log('GameStart');
    io.emit("StartGame",'');
    timer=30;
    sendturn();
    gamerunning=true;
    var intervalid=setInterval(() => {
      io.emit("tick",timer);
      if(timer==0){
         timer=30;
         turn++;
         senddeath();
      }
      if(playerlist.length==1){
        console.log("Gameend");
        gamerunning=false;
        const finalname=UNDB[playerlist[0].id];
        io.emit("endgame",'Congratulations, '+finalname+"!");
        clearInterval(intervalid);
      }
      timer--;
    }, 1000);
  });
  socket.on('flip',(msg)=>{
    timer=60-timer;
    turn++;
    sendturn();
    io.emit("tick",timer);
  });
  socket.on('deadflip',(msg)=>{
    turn++;
    sendturn();
    io.emit("tick",timer);
  });
});
async function sendturn(){
  const player=playerlist[turn%playerlist.length];
  const question=_.sample(questions);
  player.emit('turn',new Function(question)());
}
async function senddeath(){
  const player=playerlist[turn%playerlist.length];
  player.emit("die",'');
}