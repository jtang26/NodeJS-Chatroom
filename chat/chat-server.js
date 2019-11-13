// Source for server code: https://socket.io/get-started/chat/
var express = require('express');
var app = express();
var http = require('http').createServer(app);
var io = require('socket.io')(http);

app.get('/', function(req, res){
	res.sendFile(__dirname + '/client.html');
});

app.use(express.static(__dirname));

let roomList = {};
let globalRoom = "globalRoom";
roomList[globalRoom] = [];
roomList[globalRoom][0] = [];
roomList[globalRoom][5] = [];
let userID = new Object();
io.on('connection', function(socket){
	socket.on('login', function(data){
		socket.nickname = data.username;
		if(data.username in userID) {
			let meh = {'username': data.username};
			socket.emit('loginFailure',meh);
		}else{
		userID[data.username] = socket.id;
		console.log(socket.id);
		socket.join("globalRoom");
		roomList[globalRoom][0].push(data.username);
	  	let succMessage = ("successfully logged in");
	  	socket.emit('success', succMessage,);
		let userArray = roomList[globalRoom][0];
		socket.emit('userList', userArray);
		socket.to("globalRoom").emit("userList", userArray);
		let roomArray = roomList;
		socket.emit('roomList', {roomArray: roomArray});
		let roomName = globalRoom;
		socket.emit('joinedChat', roomName);
		// let chatLog = (roomList[globalRoom][5]);
		// socket.emit('chatLog', chatLog);
	}
	});
	socket.on('roomCreate', function(data){
		roomList[data.roomName] = [];
		roomList[data.roomName][0] = [];//username array
		roomList[data.roomName][1] = [];//password array
		roomList[data.roomName][2] = [];//owner of chatroom
		roomList[data.roomName][2].push(data.username);
		roomList[data.roomName][3] = [];//banned users
		roomList[data.roomName][4] = [];//Administrators
		roomList[data.roomName][5] = [];//Chat log
		if(data.password!=null){
			roomList[data.roomName][1]=data.password;
		}else{
		roomList[data.roomName][1]=null;
		}
		let roomArray = roomList;
		io.sockets.emit('successRoom', {roomArray: roomArray});
	});
	let index = -1;
	let banIndex = -1;
	let rmName = "";
	socket.on('join', function(data){
		if(!roomList[data.roomName][0].includes(data.username)) {
			if(roomList[data.roomName][1]==null){
				rmName = "";
				for (x in roomList){
				index = roomList[x][0].indexOf(data.username);
				if(roomList[x][3]!=null && roomList[x][2]!=data.username) {
				banIndex = roomList[x][3].indexOf(data.username);
				rmName = x;
				}
				if (index !== -1) roomList[x][0].splice(index, 1);
				socket.leave(roomList[x]);
				}
				if(banIndex !== -1 && data.roomName==rmName) {
					let banMsg = ("You have been banned! You cannot join this chatroom. FeelsBadMan");
					socket.emit('BanError', banMsg);
				}else{
				roomList[data.roomName][0].push(data.username);
				socket.join(roomList[data.roomName]);
				let successJoin = 'Sucessfully joined ' + data.roomName;
				let roomArray = roomList;
				socket.emit('roomList', {roomArray: roomArray});
				socket.emit('sucessJoin', successJoin);
				let userArray = roomList[data.roomName][0];
				io.emit('userList', userArray);
				let roomName = data.roomName;
				socket.emit('joinedChat', roomName);
				if(data.username==roomList[data.roomName][2]) {
					let dataXfer = {'room': data.roomName}
					socket.emit('admin', dataXfer);
					socket.emit('modding', dataXfer);
				}
			}
			}
			if((data.testPass ==roomList[data.roomName][1]) && roomList[data.roomName][1]!=null) {
				rmName = "";
				for(x in roomList) {
				index = roomList[x][0].indexOf(data.username);
				if(roomList[x][3]!=null && roomList[x][2]!=data.username) {
					banIndex = roomList[x][3].indexOf(data.username);
					rmName = x;
					}
				if (index !== -1) roomList[x][0].splice(index, 1);
				socket.leave(roomList[x]);
				}
				if(banIndex !== -1 && data.roomName==rmName) {
					let banMsg = ("You have been banned! You cannot join this chatroom. FeelsBadMan");
					socket.emit('BanError', banMsg);
				}else{
				roomList[data.roomName][0].push(data.username);
				socket.join(roomList[data.roomName]);
				let successJoin = 'Sucessfully joined ' + data.roomName;
				let roomArray = roomList;
				socket.emit('roomList', {roomArray: roomArray});
				socket.emit('sucessJoin', successJoin);
				let userArray = roomList[data.roomName][0];
				let roomName = data.roomName
				io.emit('userList', userArray);
				socket.emit('joinedChat', roomName);
				if(data.username==roomList[data.roomName][2]) {
					let dataXfer = {'room': data.roomName}
					socket.emit('admin', dataXfer);
				}
			}
			}
		}else{
		let successJoin = 'Error Username is already in ' + data.roomName;
		socket.emit('sucessJoin', successJoin);
		}
	});
	socket.on('havePassword', function (data) {
		if(roomList[data.roomName][1]==null){
			let no = 'no Password';
			socket.emit('noPass', no);
		}else{
			let yes = 'has Password';
			socket.emit('hasPass', yes);
		}
	});
	socket.on('chat message', function(msg){
		let chat = msg.username + ": " + msg.message;
		roomList[msg.roomName][0].push(chat);
		io.emit('chat success', chat);
	  });
	socket.on('kick', function(data) {
		if(!roomList[data.room][0].includes(data.username)){
			let error = data.username;
			socket.emit('kickFail',error);
		}else{
			let id=userID[data.username];
			let roomNames = {'roomName': globalRoom, 'username': data.username}
			io.to(id).emit('kickTransfer', roomNames);
			let why = "You've been kicked";
			io.to(id).emit('kickedMsg', why);
		let userArray2 = roomList[data.room][0];
		socket.emit('userList', userArray2);
		
	}
	});
	socket.on('ban', function(data) {
		if(!roomList[data.room][0].includes(data.username)){
			let error = data.username;
			socket.emit('banFail',error);
		}else{
			let id=userID[data.username];
			let roomNames = {'roomName': globalRoom, 'username': data.username}
			io.to(id).emit('banTransfer', roomNames);
			let why = "You've been banned";
			io.to(id).emit('bannedMsg', why);
			roomList[data.room][3].push(data.username);
			let userArray2 = roomList[data.room][0];
			socket.emit('userList', userArray2);
		}
	});
	socket.on('pm', function(data){
		if(!roomList[data.room][0].includes(data.username)){
			let error = data.username;
			socket.emit('pmFail',error);
		}else{
			let id = userID[data.username];
			let roomNames = {'roomName': data.roomName, 'username': data.username}
			socket.emit('pmTransfer', roomNames);
		}
	});
	socket.on('actualPM', function(data){
		let id=userID[data.username];
		let roomNames = {'roomName': data.roomName, 'username': data.username, 'pm': data.pm, 'sender': data.sender}
		io.to(id).emit('pmPost', roomNames);
		socket.emit('pmPost',roomNames);
	});
	socket.on('mod', function(data) {
		if(!roomList[data.room][0].includes(data.username)){
			let error = data.username;
			socket.emit('pmFail',error);
		}else{
			let id=userID[data.username];
			let roomNames = {'roomName': globalRoom, 'username': data.username}
			io.to(id).emit('admin', roomNames);
			let why = "You've been modded";
			io.to(id).emit('bannedMsg', why);
			roomList[data.room][5].push(data.username);
		}
	});
});

http.listen(3456, function(){
  console.log('listening on *:3456');
});

