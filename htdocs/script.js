var name = "";
var socket = io();
var chat = {};
chat.debug = {};
// Might aswell declare the song here so it instantly loads
var song = new Audio("./assets/ping.mp3");

chat.debug.ping = function(){
    song = new Audio("./assets/ping.mp3");
    song.play();
}

chat.debug.error = function(error){
    $('#messages').append($('<li>').text(error).addClass("system").addClass("error"));
}

chat.debug.log = function(log){
    $('#messages').append($('<li>').text(log).addClass("system"));
}

chat.MessageBody = function (div, what){
    div.innerHTML += "<div class=\"message\">"+what+"</div></div>";
}
chat.debug.message = function(name, what){
    $('#messages').append($('<li>').append($('<div>').attr('id', 'messageBody').addClass('messageBody').append($('<div>').addClass('name').text(name)).append($('<div>').addClass('message').text(what))));
}

chat.debug.clear = function(){
    let msgHolder = document.getElementById("messages");
    while (msgHolder.hasChildNodes()) {
        msgHolder.removeChild(msgHolder.lastChild);
    }
    console.log("Cleared messages");
}

function scrollToBottom(){
    var objDiv = document.getElementById("messagelist");
    objDiv.scrollTop = objDiv.scrollHeight;
}

$(function () {
  $('form').submit(function(e){
    e.preventDefault();
    let message = $('#m').val();
    socket.emit('chat message', message);
    if (message == ""){

    }
    else{
        chat.debug.message(name, message);
    }
    $('#m').val('');
    return false;
  });
  socket.on('chat message', function(data){
    if (data.username == name){
        console.log("Message has been sent and received from server");
    }
    else{
        chat.debug.message(data.username, data.message);
        chat.debug.ping();
    }
    scrollToBottom();
  });
  socket.on('log message', function (data){
    chat.debug.log(data);
    scrollToBottom();
   });
   socket.on('log error', function(data){
    chat.debug.error(data);
    scrollToBottom();
   })
});



function setName(){
    name = document.getElementById("name").value;
    document.getElementsByClassName("chooseName")[0].style.display = "none";
    socket.emit("name", name);
    saveName();
}


function saveName(){
    localStorage.setItem("name", name);
}

function isName(){
    var storageName = localStorage.getItem("name");
    if (storageName != "" && storageName != null && filter(storageName)){
        return true;
    }
    else{
        return false;
    }
}

function changeName(what){
    socket.emit("change name", what);
}

function getName(){
    var storageName = localStorage.getItem("name");
    if (storageName != ""){
        if (filter(storageName)){
            return storageName;
        }
    }
}

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

// Onload


if (isName()){
    name = getName();
    document.getElementsByClassName("chooseName")[0].style.display = "none";
    socket.emit("name", name);
}