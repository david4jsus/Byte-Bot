//////////////////////
// GLOBAL VARIABLES //
//////////////////////

// Socket.io variables
var socket = io();

//////////////////////
// WIDGET FUNCTIONS //
//////////////////////

// Information bar widget

function info_bar_submit() {
   
   // Get messages form the textarea object
   let info_bar_textarea = document.getElementById("info_bar_textarea");
   let messages = info_bar_textarea.value.split('\n');

   // Send the messages to the socket.io function that will handle delivering the messages to the widget
   socket.emit('info_bar_new_messages', messages);
}

function info_bar_open() {

   // Communicate with the bar through socket.io to open it and show messages
   socket.emit('info_bar_open');
}