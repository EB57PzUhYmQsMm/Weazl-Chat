var express = require('express');
var app = express();
var path = require('path');
var http = require('http').createServer(app);
var io = require('socket.io')(http);
var members = [];
const port = 3000;
var usercount = 0;
app.use(express.static(path.join(__dirname, 'htdocs')));


 http.listen(port, () => {
  console.log('Listening on *:'+port);
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
  socket.on('image', (msg) =>{
	  console.log("Received image..")
	  if (socket.name == ""){
		socket.emit("log error", "Your name is empty server side, Please refresh the page or run changeName(\"NewName\"); in F12 Console");
	  }
	  else{
		console.log("sent image");
	  	io.emit('image receive', { 
			  username: socket.name, 
			  image: msg 
		});
	  }
  });
  socket.on('chat message', (msg) => {
    let nospace = msg.replace(" ", "");
    if (msg == ""){
      socket.emit("log error", "Please type a message.");
    }
    else if (nospace == ""){
      socket.emit("log error", "Please type a proper message.")
    }
	else if (socket.name == ""){
		socket.emit("log error", "Your name is empty server side, Please refresh the page or run changeName(\"NewName\"); in F12 Console");
	}
    else if (msg.length >= 1200){
      socket.emit("log error", "Character overflow error, please turn down the amount of characters your message is using")
    }
    else{
      io.emit('chat message', {
        username: socket.name,
        message: msg
      });
    }
  });
  socket.on("memberlist", () => {
    socket.emit(members);
  });
});


function filter(name){
let nospace = name.replace(' ', '');
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