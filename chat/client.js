import io from 'socket.io-client';

let loginUser = document.getElementById("createuser");
let login = document.getElementById("login").addEventListener(login());
function login(){
  let socket = io();
  socket.emit("login");
}

alert("Hello there");


      // $(function () {
      //   var socket = io();
      //   $('form').submit(function(e){
      //     e.preventDefault();
      //     socket.emit('chat message', $('#m').val());
      //     $('#m').val('');
      //     return false;
      //   });
      //   socket.on('chat message', function(msg){
      //     $('#messages').append($('<li>').text(msg));
      //   });
      // });
