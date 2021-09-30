//////////////////////
// GLOBAL VARIABLES //
//////////////////////

// Socket.io variables
var socket = io();

// Canvas variables
var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");

// Drawing variables
var bgColor = "#ff7000";
var borderColor = "#000000";
ctx.textBaseline = "middle"; // For the messages text
ctx.lineWidth = 5;           // For the bar borders
var barAperture = 0;         // How open the message bar is (from 0 to 1, as a multiplier)

// Bar state (and how to draw it)
var barStates = [
   "closed",
   "opening",
   "open",
   "closing"
];
var currentBarState = 0;

// How long it takes to open and close the message bar
var currentTimer = 0;
var targetTimer = 0.5; // This is how long, in seconds

// Logic variables
var currentTime = Date.now();
var previousTime = currentTime;
var deltaTime = 0; // Seconds

// Info variables
var info_messages = [
   "Message #1",
   "Message #2",
   "Message #3"
];
var info_message_widths = [];
var id = -1;
var messageSpacing = 100;
var lastMessageSpawned = false; // After the last message, the bar will automatically close

// Message object
function Message(id, x, y) {
   this.id = id,                         // Message ID
   this.x = x,                           // X position
   this.y = y,                           // Y position
   this.text = info_messages[id];        // The message's text
   this.width = info_message_widths[id], // The width of the drawing of the text
   this.speed = 50;                      // Speed of the scrolling text
   this.color = "#000000",               // Color of the text
   this.font = "48px sans-serif",        // Font of the text
   this.kill = false,                    // Mark for kill once this message is off-screen
   this.Draw = () => {                   // Function to draw the scrolling text
      ctx.fillStyle = this.color;
      ctx.font = this.font;
      ctx.fillText(this.text, this.x, this.y);
   },
   this.Logic = () => {                  // Logic to update the scrolling text
      this.x -= deltaTime * this.speed;
      if (this.x + this.width <= 0) {
         this.kill = true;
      }
   }
}
message_objs = [];

///////////////
// FUNCTIONS //
///////////////

// Drawing loop
function Draw() {

   // Calculate logic
   Logic();

   // Save current canvas state (to reset clip region after)
   ctx.save();
   
   // Clear screen
   ctx.clearRect(0, 0, canvas.width, canvas.height);
   
   // Draw stuff if the bar is not closed
   if (currentBarState != 0) {
   
      // Clip all drawn content to the shape of the information bar
      DrawInfoBarShape();
      ctx.clip();
   
      // Draw background
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw messages
      drawObjectMessages();

      // Draw bar border
      drawOpenBar();
   }

   // Restore canvas state (reset clip region)
   ctx.restore();

   // Keep the loop going
   requestAnimationFrame(Draw);
}

// Calculate logic
function Logic() {
   
   // Calculate delta time
   previousTime = currentTime;
   currentTime = Date.now();
   deltaTime = (currentTime - previousTime) / 1000;

   switch (currentBarState) {
      default:
      case 0: // Closed
         break;

      case 1: // Opening

         // Increase timer
         currentTimer += deltaTime;

         // Update bar aperture
         barAperture = currentTimer / targetTimer;

         // Check for fully open
         if (currentTimer >= targetTimer) {
            currentTimer = 0;           // Reset timer
            barAperture = 1;            // Make sure bar is fully open (and not more than that)
            lastMessageSpawned = false; // Allow for mesage spawning
            id = -1;                    // Start spawning messages from the first message
            currentBarState = 2;        // Advance to next bar state (open)
         }
         
         break;

      case 2: // Open
      
         // Iterate through message objects and calculate their logic
         for (let i = 0; i < message_objs.length; i++) {
      
            // Get current message object
            let currentMessageObj = message_objs[i];
      
            // Get rid of current message object if it has been marked to kill
            if (currentMessageObj.kill) {
               message_objs.splice(i, 1);
            }
            // Otherwise, calculate its logic
            else {
               currentMessageObj.Logic();
            }
         }
      
         // Check whether a new message object can be spawned (if last message has not been spawned yet)
         if (!lastMessageSpawned) {
            let spawn = false;
            if (message_objs.length <= 0) {
               spawn = true;
            } else {
               lastMessageObj = message_objs[message_objs.length - 1];
               if (lastMessageObj.x + lastMessageObj.width + messageSpacing <= canvas.width) {
                  spawn = true;
               }
            }
            if (spawn) {
               let newID = GetNextID();
               message_objs.push(new Message(newID, canvas.width, canvas.height / 2));
               if (newID >= info_messages.length - 1) { // Checking for last message to spawn
                  lastMessageSpawned = true;
               }
            }
         }

         // Check for closing bar
         if (lastMessageSpawned && message_objs.length <= 0) {
            currentBarState = 3;
         }

         break;

      case 3: // Closing

         // Increase timer
         currentTimer += deltaTime;

         // Update bar aperture
         barAperture = 1 - (currentTimer / targetTimer);

         // Check for fully closed
         if (currentTimer >= targetTimer) {
            currentTimer = 0;    // Reset timer
            barAperture = 0;     // Make sure bar is fully closed (and not any less)
            currentBarState = 0; // Advance to next bar state (closed)
         }

         break;
   }
}

// Get the shape for the information bar
function DrawInfoBarShape() {
   let barWidth = canvas.width * barAperture;
   barWidth = Math.max(barWidth, 60); // Don't let bar be smaller than 60px wide
   ctx.beginPath();
   ctx.moveTo(50, 2);
   ctx.lineTo(barWidth - 25, 2);
   ctx.quadraticCurveTo(barWidth, 2, barWidth - 5, 25);
   ctx.lineTo(barWidth - 30, canvas.height - 15);
   ctx.quadraticCurveTo(barWidth - 35, canvas.height - 5, barWidth - 50, canvas.height - 2);
   ctx.lineTo(25, canvas.height - 2);
   ctx.quadraticCurveTo(-5, canvas.height - 2, 5, canvas.height - 25);
   ctx.lineTo(30, 15);
   ctx.quadraticCurveTo(35, 5, 50, 2);
}

// Draw message objects
function drawObjectMessages() {
   for (let i = 0; i < message_objs.length; i++) {
      message_objs[i].Draw();
   }
}

// Draw bar border when bar is open
function drawOpenBar() {
   ctx.strokeStyle = borderColor;
   DrawInfoBarShape();
   ctx.stroke();
}

// Get messages from the control panel
function UpdateMessages() {

   // Get messages

   // Recalculate widths
   CalculateMessageWidths();
}

// Receive new messages
socket.on('info_bar_new_messages', (newMessages) => {

   // Overwrite messages
   info_messages = newMessages;

   // Recalculate message widths
   CalculateMessageWidths();
});

// Calculate width of messages
function CalculateMessageWidths() {

   // Empty out current widths array
   info_message_widths = [];

   // Iterate through messages and get estimated widths
   for (let i = 0; i < info_messages.length; i++) {
      info_message_widths[i] = info_messages[i].length * 25;
   }
}

// Get next ID for next message to display
function GetNextID() {

   // Increase ID counter
   id++;
   if (id >= info_messages.length) {
      id = 0;
   }

   // Return current ID
   return id;
}

// Open message bar
function OpenBar() {

   // Open only if it is currently closed
   if (currentBarState == 0) {
      currentBarState = 1;
   }
}

// Receive request to open bar
socket.on('info_bar_open', () => {
   OpenBar();
});

//////////
// MAIN //
//////////

// Get messages and update variables
UpdateMessages();

// Start drawing loop
requestAnimationFrame(Draw);