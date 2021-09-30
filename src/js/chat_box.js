//////////////////////
// GLOBAL VARIABLES //
//////////////////////

// Socket.io variables
var socket = io();

// Chat box variables
var textbox = document.getElementById("text_box");

///////////////
// FUNCTIONS //
///////////////

// Send the text to the chat
function SendToChat() {

   // Get test to send
   let text = textbox.value;

   // Emit 'SendToChat' message through socket.io
   socket.emit('send_to_chat', text);
}