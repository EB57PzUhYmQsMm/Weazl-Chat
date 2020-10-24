var name = "";
var socket = io();
var chat = {};
chat.debug = {};
// Might aswell declare the song here so it instantly loads
var song = new Audio("./assets/ping.mp3");

function urlify(text) {
    var urlRegex = /(https?:\/\/[^\s]+)/g;
    return text.replace(urlRegex, function(url) {
      return '<a target="_blank" href="' + url + '">' + url + '</a>';
    })
    // or alternatively
    // return text.replace(urlRegex, '<a href="$1">$1</a>')
  }

// This is how we will know when to remove messages from memory so we don't start using 200 gigabytes in our memory
function getCount(parent, getChildrensChildren){
    var relevantChildren = 0;
    var children = parent.childNodes.length;
    for(var i=0; i < children; i++){
        if(parent.childNodes[i].nodeType != 3){
            if(getChildrensChildren)
                relevantChildren += getCount(parent.childNodes[i],true);
            relevantChildren++;
        }
    }
    return relevantChildren;
}


chat.debug.ping = function(){
    // I do this so it can play the song as many times in a second as it wants even if the other ping hasn't finished yet
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
    $('#messages').append($('<li>').append($('<div>').attr('id', 'messageBody').addClass('messageBody').append($('<div>').addClass('name').text(name)).append($('<div>').addClass('message').html(what))));
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
    let nospace = message.replace(" ", "");
    socket.emit('chat message', message);
    console.log(message.length);
    if (message == ""){

    }
    else if (nospace == ""){

    }
    else if (message.length >= 1200){
        chat.debug.error("Please type a smaller message; Current character count is: "+message.length);
        let element = document.getElementById("messages");
        let amountOfDivs = Number(getCount(element, false));
        console.log("Message Count: "+amountOfDivs);
        if (amountOfDivs >= 49){
            $('#messages').find('li').first().remove();
        }
    }
    else{
        chat.debug.message(name, urlify(message));
        let element = document.getElementById("messages");
        let amountOfDivs = Number(getCount(element, false));
        console.log("Message Count: "+amountOfDivs);
        if (amountOfDivs >= 49){
            $('#messages').find('li').first().remove();
        }
    }
    $('#m').val('');
    return false;
  });
  socket.on('chat message', function(data){
    if (data.username == name){
        console.log("Message has been sent and received from server");
    }
    else{
        if (document.hasFocus()){
            let element = document.getElementById("messages");
            let amountOfDivs = Number(getCount(element, false));
            console.log("Message Count: "+amountOfDivs);
            if (amountOfDivs >= 49){
                $('#messages').find('li').first().remove();
            }
        }
        else{
            let element = document.getElementById("messages");
            let amountOfDivs = Number(getCount(element, false));
            console.log("Message Count: "+amountOfDivs);
            if (amountOfDivs >= 49){
                $('#messages').find('li').first().remove();
            }
            chat.debug.ping();
        }
        chat.debug.message(data.username, urlify(data.message));
    }
    scrollToBottom();
  });
  socket.on('log message', function (data){
    chat.debug.log(data);
    let element = document.getElementById("messages");
    let amountOfDivs = Number(getCount(element, false));
    console.log("Message Count: "+amountOfDivs);
    if (amountOfDivs >= 49){
        $('#messages').find('li').first().remove();
    }
    scrollToBottom();
   });
   socket.on('log error', function(data){
    chat.debug.error(data);
    let element = document.getElementById("messages");
    let amountOfDivs = Number(getCount(element, false));
    console.log("Message Count: "+amountOfDivs);
    if (amountOfDivs >= 49){
        $('#messages').find('li').first().remove();
    }
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
    name = what;
    localStorage.setItem("name", name);
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