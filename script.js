var name = "";
var socket = io();
var chat = {};
chat.debug = {};

chat.debug.error = function(error){
    $('#messages').append($('<li>').text(error).addClass("system").addClass("error"));
}

chat.debug.log = function(log){
    $('#messages').append($('<li>').text(log).addClass("system"));
}

chat.debug.message = function(name, what){
    $('#messages').append($('<li>').append($('<div>').addClass('messageBody').append($('<div>').addClass('name').text(name)).append($('<div>').addClass('message').text(what))));
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
    e.preventDefault(); // prevents page reloading
    socket.emit('chat message', $('#m').val());
    $('#m').val('');
    return false;
  });
  socket.on('chat message', function(data){
    $('#messages').append($('<li>').append($('<div>').addClass('messageBody').append($('<div>').addClass('name').text(data.username)).append($('<div>').addClass('message').text(data.message))));
    scrollToBottom();
  });
  socket.on('log message', function (data){
    $('#messages').append($('<li>').text(data).addClass("system"));
   });
   socket.on('log error', function(data){
    $('#messages').append($('<li>').text(data).addClass("system").addClass("error"));
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
