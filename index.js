var app = require('express')();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
var members = [];
var usercount = 0;
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

app.get('/script.js', (req, res) => {
  res.sendFile(__dirname + '/script.js');
});

app.get('/style.css', (req, res) => {
  res.sendFile(__dirname + '/style.css');
})

app.get('/assets/emoji.png', (req, res) => {
  res.sendFile(__dirname + '/assets/emoji.png');
})

var ConnectedUsers = [];

io.on('connection', (socket) => {
    console.log('a user connected');
    usercount++;
    console.log("Users: "+usercount);
    socket.emit("");
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
  })
});

io.on('connection', (socket) => {
    socket.broadcast.emit('Connecting....');
});

setInterval(function(){

}, 500);

http.listen(80, () => {
  console.log('Listening on *:80');
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