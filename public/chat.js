var socket = io();
var messages = document.getElementById('messages');

socket.on('bolita', function(msg) {
    var item = document.createElement('li');
    item.textContent = msg;
    messages.appendChild(item);
    window.scrollTo(0, document.body.scrollHeight);
  })






