
let roomList = {};
let globalRoom = "globalRoom";
let currentRoom;

socket = io.connect();
socket.on('connection', function(socket){
  console.log('a user connected');
  socket.on('disconnect', function(){
    console.log('user disconnected');
  });
});

document.getElementById("loginButton").addEventListener('click', userLogin, false);
let username;
function userLogin() {
  let user = document.getElementById('createUser').value;
  username = user;
  document.getElementById('hello').innerHTML = "Hi " + username;
  let data = {'id': socket.id, 'username': user};
  socket.emit('login', data);
}

socket.on('success',(succMessage) =>{
document.getElementById("user").style.display = "none";
document.getElementById("page").style.display = "block";
});

socket.on('userList', (userArray) => {
  let e = document.getElementById('usernameList');
  e.innerHTML = "";
  for(var i =0; i<userArray.length; i++) {
    let listUser = document.createElement("li");
    listUser.innerHTML = userArray[i];
  document.getElementById('usernameList').appendChild(listUser);
  }
});

socket.on('roomList', function(roomArray){
  let lobby = Object.keys(roomArray["roomArray"]);
  for (let i = 0; i < lobby.length; i++) {
    if(lobby.length==1) {
      let room = document.createElement("button");
      room.setAttribute("id", "room" + 0); 
      room.addEventListener("click", function (event) {
      let roomNames = {'roomName': lobby[0], 'username': username}
      socket.emit('join', roomNames);
    });
    room.innerHTML = lobby[0];
    let soDamnTired = document.getElementById('roomsList').appendChild(room);
    }
    if(lobby.length>1){
      if(lobby[i]==globalRoom){
        let e = document.getElementById('roomsList');
        e.innerHTML = "";
        let room = document.createElement("button");
        room.setAttribute("id", "room" + 0); 
        room.addEventListener("click", function (event) {
        let roomNames = {'roomName': lobby[0], 'username': username}
        socket.emit('join', roomNames);
        });
        room.innerHTML = lobby[0];
        document.getElementById('roomsList').appendChild(room);
      }else{
        let roomNext = document.createElement("button");
        roomNext.setAttribute("id", "room" + i); 
        roomNext.addEventListener("click", function (event){
          let roomNames = {'roomName': lobby[i], 'username': username}
          socket.emit('havePassword', roomNames);
          socket.on('noPass', (no) => {
          socket.emit('join', roomNames);
        });
        socket.on('hasPass', (yes) => {
          let testPass = prompt("Please enter the chatroom Password");
          let roomData = {'roomName': rooms[i], 'username': username, 'testPass': testPass};
          socket.emit('join', roomData);
        });
      });
        roomNext.innerHTML = lobby[i];
        document.getElementById('roomsList').appendChild(roomNext);
      }
    }
  }  
    
});

document.getElementById("chatSubmitButton").addEventListener('click', chatting, false);
function chatting() {
  let message = document.getElementById('chatting').value;
  let data = {'username': username, 'message': message, 'roomName': currentRoom};
  socket.emit('chat message', data);
}

socket.on('chat success', function(chat){
    let chatMsg = document.createElement('p');
    chatMsg.innerHTML=chat;
    document.getElementById('messageBox').appendChild(chatMsg);
    document.getElementById('chatting').value='';
});

socket.on('loginFailure', (data) =>{
  alert(data.username +  "already exists. Please enter another username");
});

document.getElementById("createChatButton").addEventListener('click', chatCreate, false);
let roomName;
function chatCreate() {
  let room = document.getElementById('roomName').value;
  roomName = room;
  let pass=prompt("Please enter a password if you would like a private chatRoom else press cancel");
  let data = {'id': socket.id, 'username': username, 'roomName': roomName, 'password': pass};
  socket.emit('roomCreate', data);
}
socket.on('successRoom' ,function(roomArray) {
  
  let rooms = Object.keys(roomArray["roomArray"]);
  
  for (let i = rooms.length-1; i < rooms.length; i++) {

    let room = document.createElement("button");
    room.setAttribute("id", "room" + i); 
    room.addEventListener("click", function (event){
      let roomNames = {'roomName': rooms[i], 'username': username}
      socket.emit('havePassword', roomNames);
      socket.on('noPass', (no) => {
      socket.emit('join', roomNames);
    });
    socket.on('hasPass', (yes) => {
      let testPass = prompt("Please enter the chatroom Password");
      let roomData = {'roomName': rooms[i], 'username': username, 'testPass': testPass};
      socket.emit('join', roomData);
    });
  });
    room.innerHTML = rooms[i];
    document.getElementById('roomsList').appendChild(room);
}
});
socket.on('sucessJoin', (successJoin) => {
  alert(successJoin);
  let chatBox = document.getElementById('messageBox');
  chatBox.innerHTML = "";
});

socket.on('joinedChat', function(roomName){
  let name = document.getElementById("curRoom").innerHTML;
  name = "";
  document.getElementById("curRoom").innerHTML = "Current Room: " + roomName; 
  currentRoom = roomName;
});

socket.on('test', (data) => {
  console.log(data)
});

socket.on('admin', (data) => {
  document.getElementById("administrator").style.display = "block";
  document.getElementById("KickUserButton").addEventListener('click', kickFunc, false);
function kickFunc() {
  let user = document.getElementById('kicked').value;
  let dataSend = {'room': data.room, 'username': user};
  socket.emit('kick', dataSend);
}
document.getElementById("BanUserButton").addEventListener('click', banFunc, false);
function banFunc() {
  let user = document.getElementById('banned').value;
  let dataSend = {'room': data.room, 'username': user};
  socket.emit('ban', dataSend);
}
});

socket.on('kickFail',(data) =>{
  alert("Error: " + data + " does not exist! Please kick an actual user");
});

socket.on('banFail',(data) =>{
  alert("Error: " + data + " does not exist! Please ban an actual user");
});


socket.on('banMsg',(data) =>{
  alert("Error: " + data);
});

socket.on('kickedMsg',(data) =>{
  alert(data);
});

socket.on('bannedMsg',(data) =>{
  alert(data);
});

socket.on('kickTransfer',(data)=>{
  let roomNames = {'roomName': data.roomName, 'username': data.username}
  socket.emit('join', roomNames);
});

socket.on('banTransfer',(data)=>{
  let roomNames = {'roomName': data.roomName, 'username': data.username}
  socket.emit('join', roomNames);
});

socket.on('BanError',(data) =>{
  alert(data);
});

socket.on('pmFail',(data) =>{
  alert('username does not exist' + data);
});

document.getElementById("pmButton").addEventListener('click', pmFunc, false);
function pmFunc(){
  let user = document.getElementById('pmsearch').value;
  let dataSend = {'room': currentRoom, 'username': user};
  socket.emit('pm', dataSend);
}

socket.on('pmTransfer',(data)=>{
  document.getElementById('pmbox').style.display = "block";
  let pm=prompt("Please enter a private message you would like to send.");
  let sentdata = {'username': data.username, 'roomName': roomName, 'pm': pm, 'sender': username};
  socket.emit('actualPM', sentdata);
});

socket.on('pmPost', (data)=>{
  document.getElementById('pmbox').style.display = "block";
  let chatMsg = document.createElement('p');
  document.getElementById('PM').appendChild(chatMsg);
  
    chatMsg.innerHTML=data.sender + ": " + data.pm;
    document.getElementById('pmsearch').value='';
});

socket.on('modding',(data)=>{
document.getElementById('modBox').style.display = "block";
document.getElementById("ModButton").addEventListener('click', modFunc, false);
function modFunc(){
  let user = document.getElementById('modInput').value;
  let dataSend = {'room': data.room, 'username': user};
  socket.emit('mod', dataSend);
}
});