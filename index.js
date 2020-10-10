var express = require('express');
var app = express();
var path = require('path');
var http = require('http').createServer(app);
var io = require('socket.io')(http);
var members = [];
var usercount = 0;
app.use(express.static(path.join(__dirname, 'htdocs')));


 http.listen(80, () => {
  console.log('Listening on *:80');
});


// socket code

io.on('connection', (socket) => {
  console.log('a user connected');
  usercount++;
  console.log("Users: "+usercount);
  socket.on('disconnect', () => {
    console.log('user disconnected');
    usercount -= 1;
    console.log("Users: "+usercount);
  });
});

io.on('connection', (socket) => {
  socket.on("name", (msg) => {
    socket.name = msg;
    io.emit('log message', socket.name+" has joined the chatroom!");
    io.emit('log message', "there are now "+usercount+" participant(s)");
  })
  socket.on("change name", (name) => {
    if ((filter(name))){
      socket.name = name;
      socket.emit("log message", "{System} Changed your name serverside.");
    }
    else{
      socket.name = "DefaultUser";
      socket.emit("log error", "{System} Could not change your name since it contains profanity / illegal characters");
    }
  });
  socket.on('chat message', (msg) => {
    if (msg == ""){
      socket.emit("log error", "Please type a message.");
    }
    else{
      if (!(filter(socket.name))){
        io.emit('chat message', {
          username: "DefaultUser",
          message: msg
        });
      }
      else{
        io.emit('chat message', {
          username: socket.name,
          message: msg
        });
      }
    }
  });
  socket.on("memberlist", () => {
    socket.emit(members);
  });
});


function filter(name){
let nospace = name.replace(/\s/g, '');
name = name.toLowerCase();
if (nospace == ""){
    return false;
}
if (name.includes("fuck")){
   return false;
}
if (name.includes("bitch")){
   return false;
}
else{
   return true;
}
return true;
}