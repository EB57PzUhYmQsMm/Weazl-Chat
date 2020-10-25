var name = "";
var socket = io();
var chat = {};
chat.debug = {};

chat.overlayOpen = false;
chat.messageCap = 50;
// Might aswell declare the song here so it instantly loads
var song = new Audio("./assets/ping.mp3");

function loadData(){
	if (loadItem("messageCap")){
		chat.messageCap = Number(localStorage.getItem("messageCap"));
	}
}

function loadItem(name){
	if (localStorage.getItem(name) != null && localStorage.getItem(name) != ""){
		return true;
	}
	else{
		return false;
	}
}
// Found on stackoverflow, since I don't want to do this server-side
function urlify(text) {
    var urlRegex = /(https?:\/\/[^\s]+)/g;
    return text.replace(urlRegex, function(url) {
      if (isUriImage(url)){
        return '<img onclick="showImage(\''+url+'\');" src="'+url+'" class="image link"></img>';
      }
      else if (isVideo(url)){
          return '<video width="350" height="150" controls><source src="'+url+'" type="video/mp4"></video>';
      }
      else if (isYoutube(url)){
          return '<iframe src="https://www.youtube-nocookie.com/embed/'+getIdFromYoutube(url)+'" fullscreen></iframe>';
      }
	  else if (url.includes("chat.frionx.repl.co/download")){
		  return '<a target="_blank" href="' + url + '">' + url + '</a><br><div id="discordInvite" style="width: 250px;"><h5 id="introText" class="noselect loadHidden">Download Weazl</h5><div id="discordData"><div id="discordInfo"><div id="serverNameBox" class="discordLink"><span class="noselect" id="serverName">Weazl</span></div><button type="button" onclick="download();" class="discordLink" id="callToAction"><div id="buttonText" class="noselect">Download</div></button></div></div>';
	  }
      else{
        return '<a target="_blank" href="' + url + '">' + url + '</a>';
      }
    })
    // or alternatively
    // return text.replace(urlRegex, '<a href="$1">$1</a>')
}
// Based off of the stackoverflow image thing, but made by myself
function isVideo(uri){
    uri = uri.split('?')[0];
    var parts = uri.split('.');
    var extension = parts[parts.length-1];
    var imageTypes = ['mp4'];
    if(imageTypes.indexOf(extension) !== -1) {
        return true;   
    }
}
function getIdFromYoutube(uri){
    if (uri.toString().includes("youtube.com")){
        return uri.substring(uri.indexOf("?v=") + 3);
    }
    else{
        return "0";
    }
}
// Checking if its a youtube video, then just iframe it
function isYoutube(uri){
    uri = uri.split('?')[0];
    if (uri.toString().includes("youtube.com")){
        return true;
    }
    else{
        return false;
    }
}
// Another thing found on stackoverflow just to save time
var isUriImage = function(uri) {
        //make sure we remove any nasty GET params 
        uri = uri.split('?')[0];
        //moving on, split the uri into parts that had dots before them
        var parts = uri.split('.');
        //get the last part ( should be the extension )
        var extension = parts[parts.length-1];
        //define some image types to test against
        var imageTypes = ['jpg','jpeg','tiff','png','gif','bmp'];
        //check if the extension matches anything in the list.
        if(imageTypes.indexOf(extension) !== -1) {
            return true;   
        }
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
    scrollToBottom();
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
		capMessages();
    }
    else{
        chat.debug.message(name, urlify(message));
		capMessages();
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
			capMessages();
        }
        else{
			capMessages();
			notifyMe(data.username, data.message);
            chat.debug.ping();
        }
        chat.debug.message(data.username, urlify(data.message));
    }
    scrollToBottom();
  });
  socket.on('image receive', function(data){
	let username = data.username;
	let image = data.image;
	console.log("Receiving Image...");
	chat.debug.message(username, `<img onclick='showImage("${image}");' src='${image}' class="image link"></img>`)
  });
  socket.on('log message', function (data){
    chat.debug.log(data);
	capMessages();
    scrollToBottom();
   });
   socket.on('log error', function(data){
    chat.debug.error(data);
	capMessages();
    scrollToBottom();
   })
});

function capMessages(){
    let element = document.getElementById("messages");
    let amountOfDivs = Number(getCount(element, false));
    console.log("Message Count: "+amountOfDivs);
    if (amountOfDivs >= chat.messageCap){
        $('#messages').find('li').first().remove();
    }
}

function setName(){
    name = document.getElementById("name").value;
    document.getElementsByClassName("chooseName")[0].style.display = "none";
    socket.emit("name", name);
    saveName();
}


function saveName(){
    localStorage.setItem("name", name);
	$("#m").removeAttr("disabled");
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

function requestNotifs(){
	Notification.requestPermission();
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

function download(){
	window.open("Application.zip");
}

function notifyMe(title, body="defaultbody") {
  // Let's check if the browser supports notifications
  if (!("Notification" in window)) {
    alert("This browser does not support desktop notification");
  }

  // Let's check whether notification permissions have already been granted
  else if (Notification.permission === "granted") {
    // If it's okay let's create a notification
    var notification = new Notification(title, {
		body: body,
		icon: 'https://chat.frionx.repl.co/assets/weazl_nb.png'
	});
  }

  // Otherwise, we need to ask the user for permission
  else if (Notification.permission !== "denied") {
    Notification.requestPermission().then(function (permission) {
      // If the user accepts, let's create a notification
      if (permission === "granted") {
    	var notification = new Notification(title, {
			body: body,
			icon: 'https://chat.frionx.repl.co/assets/weazl_nb.png'
		});
      }
    });
  }

  // At last, if the user has denied notifications, and you 
  // want to be respectful there is no need to bother them any more.
}
function isElectron() {
    // Renderer process
    if (typeof window !== 'undefined' && typeof window.process === 'object' && window.process.type === 'renderer') {
        return true;
    }

    // Main process
    if (typeof process !== 'undefined' && typeof process.versions === 'object' && !!process.versions.electron) {
        return true;
    }

    // Detect the user agent when the `nodeIntegration` option is set to true
    if (typeof navigator === 'object' && typeof navigator.userAgent === 'string' && navigator.userAgent.indexOf('Electron') >= 0) {
        return true;
    }

    return false;
}
// Onload

notifyMe("Thank you for enabling notifications!", "Welcome to Weazl Chat!");
if (isName()){
	$("#m").removeAttr("disabled");
    name = getName();
    document.getElementsByClassName("chooseName")[0].style.display = "none";
    socket.emit("name", name);
}

document.onkeypress = function (e) {
    if (name != "" && chat.overlayOpen == false){
        $('#m').focus();
    }
}

function openCity(evt, cityName) {
  var i, tabcontent, tablinks;
  tabcontent = document.getElementsByClassName("tabcontent");
  for (i = 0; i < tabcontent.length; i++) {
    tabcontent[i].style.display = "none";
  }
  tablinks = document.getElementsByClassName("tablinks");
  for (i = 0; i < tablinks.length; i++) {
    tablinks[i].className = tablinks[i].className.replace(" active", "");
  }
  document.getElementById(cityName).style.display = "block";
  evt.currentTarget.className += " active";
}

function saveSetting(name){
	switch (name){
		case "name":
			let chatName = $("#chatName").val();
			changeName(chatName);
			break;
		case "messageCap":
			let messageCapacity = $("#messageCap").val();
			chat.messageCap = Number(messageCapacity);
			chat.debug.log("Changed message cap!");
			localStorage.setItem("messageCap", messageCapacity);
			break;
		default:
			console.log("Could not get setting to save");
			break;
	}
}

// Get the element with id="defaultOpen" and click on it
document.getElementById("defaultOpen").click();

function showImage(url){
    $("#overlayContainer").attr('src', url);
    document.getElementById("overlay").style.display = "block";
	chat.overlayOpen = true;
}
function hideOverlay(){
    document.getElementById("overlay").style.display = "none";
	chat.overlayOpen = false;
}

function showSettings(){
    document.getElementById("overlaySettings").style.display = "block";
	chat.overlayOpen = true;
}

function hideSettings(){
    document.getElementById("overlaySettings").style.display = "none";
	chat.overlayOpen = false;
}

if (isElectron()){
	console.log("User is running under /Weazl/App");
}
else{
	console.log("User is in browser-mode");
}

loadData();
/*
function retrieveImageFromClipboardAsBlob(pasteEvent, callback){
	if(pasteEvent.clipboardData == false){
        if(typeof(callback) == "function"){
            callback(undefined);
        }
    };

    var items = pasteEvent.clipboardData.items;

    if(items == undefined){
        if(typeof(callback) == "function"){
            callback(undefined);
        }
    };

    for (var i = 0; i < items.length; i++) {
        // Skip content if not image
        if (items[i].type.indexOf("image") == -1) continue;
        // Retrieve image on clipboard as blob
        var blob = items[i].getAsFile();

        if(typeof(callback) == "function"){
            callback(blob);
        }
    }
}


window.addEventListener("paste", function(e){

    // Handle the event
    retrieveImageFromClipboardAsBlob(e, function(imageBlob){
        // If there's an image, display it in the canvas
        if(imageBlob){
            var URLObj = window.URL || window.webkitURL;
            var jesus = URLObj.createObjectURL(imageBlob);
			console.log(jesus);
        }
    });
}, false);
*/
document.onpaste = function (event) {
  // use event.originalEvent.clipboard for newer chrome versions
  var items = (event.clipboardData  || event.originalEvent.clipboardData).items;
  console.log(JSON.stringify(items)); // will give you the mime types
  // find pasted image among pasted items
  var blob = null;
  for (var i = 0; i < items.length; i++) {
    if (items[i].type.indexOf("image") === 0) {
      blob = items[i].getAsFile();
    }
  }
  // load image if there is a pasted image
  if (blob !== null) {
    var reader = new FileReader();
    reader.onload = function(event) {
		socket.emit("image", event.target.result);
		console.log(event.target.result);
    };
    reader.readAsDataURL(blob);
  }
}