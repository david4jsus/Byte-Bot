//////////////////
// DEPENDENCIES //
//////////////////

const express = require('express');
const fs = require('fs');
const http = require('http');
const socketIO = require('socket.io');
const tmi = require('tmi.js');
const twitch_token = require('./token');

//////////////////////
// GLOBAL VARIABLES //
//////////////////////

const port = process.env.port || 3000;
const app = express();
const server = http.createServer(app);
const io = socketIO(server);
const current_channel = 'david4jsus';
const client = new tmi.Client({
   options: {debug: true},
   connection: {
      secure: true,
      reconnect: true
   },
   identity: {
      username: 'the_byte_bot',
      password: twitch_token.TWITCH_OAUTH_TOKEN
   },
   channels: [current_channel]
});
var streaming_mode = false;

///////////////
// FUNCTIONS //
///////////////

// Initial setup
function Init() {

   // Set up static resources
   InitResources();

   // Set up routing
   InitRouting();

   // Set up server-side socket.io connections
   InitSocketIOConnections();

   // Setup chat commands
   InitChatCommands();

   // Initiate connections
   InitConnections();
}

// Set up static resources
function InitResources() {
   app.use(express.static('src'));
   app.use('/css', express.static(__dirname + 'src/css'));
   app.use('/js', express.static(__dirname + 'src/js'));
   app.use('/assets', express.static('assets'));
}

// Set up routing
function InitRouting() {

   // Default response - index.html -> Control Panel
   app.get('/', (req, res) => {
      res.sendFile(__dirname + '/index.html');
   });

   // Widgets

   // Intro sequence
   app.get('/intro', (req, res) => {
      res.sendFile(__dirname + '/widgets/intro.html');
   });

   // Square frame
   app.get('/square_frame', (req, res) => {
      res.sendFile(__dirname + '/widgets/square_frame.html');
   });

   // Information bar
   app.get('/info_bar', (req, res) => {
      res.sendFile(__dirname + '/widgets/info_bar.html');
   });

   // Chat box
   app.get('/chat_box', (req, res) => {
      res.sendFile(__dirname + '/widgets/chat_box.html');
   });
}

// Set up server-side socket.io connections
function InitSocketIOConnections() {
   io.on('connection', (socket) => {

      // Notify of user connect
      console.info('User connected');

      // Widget socket functions

      socket.on('fetch_info_bar_messages', (callback) => {
         //console.info('== Server received request to fetch saved messages for info bar widget, fetching messages...');
         fs.readFile('data/info_bar_messages.txt', 'utf8', (err, data) => {
            if (err) {
               console.error(err);
               return;
            }
            //socket.broadcast.emit('info_bar_update_messages', data);
            callback(data);
            //console.info('== Messages fetched, sending the following:\n' + data);
         });
      });

      socket.on('info_bar_new_messages', (msg) => {
         socket.broadcast.emit('info_bar_new_messages', msg);
         //console.info('== Server received request to change info bar messages, sending now the following:\n' + msg);
      });

      socket.on('info_bar_open', () => {
         socket.broadcast.emit('info_bar_open');
         //console.info('== Server received request to open the information bar, opening now...');
      });

      socket.on('send_to_chat', (msg) => {
         SendToChat(msg);
         //console.info('== Server received request to send text to the chat, sending now the following:\n' + msg);
      });

      socket.on('start_stream_signal', () => {
         if (!streaming_mode) {
            StartStreamMode();
            //console.info('== Server is now transitioning to streaming mode...')
         }
      });

      // Notify of user disconnect
      socket.on('disconnect', () => {
         console.info('User disconnected');
      });
   });
}

// Set up chat commands
function InitChatCommands() {
   client.on('message', (channel, tags, message, self) => {

      // Ignore incoming message if from self or not a command
      if (self || !message.startsWith('!')) {
         return;
      }

      // Parse message to get command
      const args = message.slice(1).split(' ');
      const command = args.shift().toLowerCase();

      // Parse commands

      if (command === "startstream") {
         socket.broadcast.emit("start_stream_command");
      }
   });
}

// Initiate connections
function InitConnections() {

   // Start Node.js server
   server.listen(port, () => {
      console.info('Server listening on port ' + port);
   });

   // Connect to Twitch
   client.connect();
}

// Enable bot's streaming mode
function StartStreamMode() {

   // Set flag
   streaming_mode = true;

   // Notify other widgets
}

//////////////////////
// WIDGET FUNCTIONS //
//////////////////////

// Send text to the chat
function SendToChat(text) {
   client.say(current_channel, text);
}

//////////
// MAIN //
//////////

// Initialize and start bot
Init();