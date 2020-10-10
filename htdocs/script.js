var name = "";
var socket = io();
var chat = {};
chat.debug = {};
chat.lastMessageName = "";
chat.lastMessageText = "";

chat.debug.error = function(error){
    $('#messages').append($('<li>').text(error).addClass("system").addClass("error"));
}

chat.debug.log = function(log){
    $('#messages').append($('<li>').text(log).addClass("system"));
}

// Returns a DIV of a message
chat.getLastMessage = function(){
    let MessageTexts = document.getElementById("messages");
    let div = chat.processMessageList(MessageTexts);
    if (div == null){
        console.log("element does not exist");
        return null;
    }
    else {
        console.log("returing div..");
        return div;
    }
}


chat.processMessageList = function(ul) {
    if (!ul.childNodes || ul.childNodes.length == 0) return;
    // TODO: make it so that if a user sends two different messages, the iterator iterates through the messages in that messageBody
    // so we can see if any of the messages match and not just the original one
    for (var itemi=0;itemi<ul.childNodes.length;itemi++) {
        var item = ul.childNodes[itemi];
        if (item.nodeName == "LI" && item.className != "system" && item.className != "system error") {
            let MessageBody = item.getElementsByClassName("messageBody")[0];
            let MessageName = MessageBody.getElementsByClassName("name")[0];
            let MessageText = MessageBody.getElementsByClassName("message")[0];
            if (MessageName.innerHTML == chat.lastMessageName && MessageText.innerHTML == chat.lastMessageText){
                return MessageBody;
            }
        }
    }
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
    e.preventDefault(); // prevents page reloading
    socket.emit('chat message', $('#m').val());
    $('#m').val('');
    return false;
  });
  socket.on('chat message', function(data){
    if (chat.lastMessageName == "" && chat.lastMessageText == ""){
        chat.lastMessageName = data.username;
        chat.lastMessageText = data.message;
        chat.debug.message(data.username, data.message);
    }
    else{
        if (chat.lastMessageName == data.username){
            let lastMessageTextDiv = chat.getLastMessage();
            if (lastMessageTextDiv != null){
                chat.lastMessageText = data.message;
                chat.MessageBody(lastMessageTextDiv, data.message);
            }
            else{
                chat.lastMessageName = data.username;
                chat.lastMessageText = data.message;
                chat.debug.message(data.username, data.message);
            }
        }
    }
    scrollToBottom();
  });
  socket.on('log message', function (data){
    chat.debug.log(data);
   });
   socket.on('log error', function(data){
    chat.debug.error(data);
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