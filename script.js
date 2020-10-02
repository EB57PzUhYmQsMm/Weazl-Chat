var name = "";
var socket = io();

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
  //socket.on('')
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