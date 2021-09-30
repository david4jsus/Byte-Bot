//////////////////////
// GLOBAL VARIABLES //
//////////////////////

// Canvas variables
var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");

// Logic variables
var currentTime = previousTime = Date.now();
var deltaTime = 0;
var timerLength = 2 * Math.PI;
var timerInitial = 0;
var timerSpeed = 0.25;
var currentTimer = 0;

// Drawing variables
var frameColor = "orange";
var border = false;
var borderWidth = 25;

///////////////
// FUNCTIONS //
///////////////

// Draw the frame (+ logic)
function Draw() {

   // Perform some logic before drawing
   Logic();
   
   // Clear the canvas
   ctx.clearRect(0, 0, canvas.width, canvas.height);
   
   // Draw the frame
   ctx.fillStyle = frameColor;
   ctx.fillRect(0, 0, canvas.width, canvas.height);
   if (border) {
      ctx.fillStyle = "black";
      ctx.fillRect(borderWidth, borderWidth, canvas.width - borderWidth * 2, canvas.height - borderWidth * 2);
   }
   
   // Keep the drawing looop going
   requestAnimationFrame(Draw);
}

// Logic for drawing the frame
function Logic() {
   
   // Calculate delta time
   previousTime = currentTime;
   currentTime = Date.now();
   deltaTime = (currentTime - previousTime) / 1000;

   // Manage timer
   currentTimer += timerSpeed * deltaTime;
   if (currentTimer >= timerLength) {
      currentTimer = timerInitial;
   }

   // Create gradient
   let halfWidth = canvas.width / 2;
   let halfHeight = canvas.height / 2;
   let x = (Math.cos(currentTimer) * halfWidth) + halfWidth;
   let y = (Math.sin(currentTimer) * halfHeight) + halfHeight;
   let gradient = ctx.createLinearGradient (x, y, canvas.width - x, canvas.height - y);
   gradient.addColorStop(0.0, "blue");
   gradient.addColorStop(0.2, "red");
   gradient.addColorStop(0.3, "orange");
   gradient.addColorStop(0.6, "orange");
   gradient.addColorStop(0.7, "red");
   gradient.addColorStop(1.0, "blue");
   frameColor = gradient;
}

//////////
// MAIN //
//////////

// Start the drawing loop
requestAnimationFrame(Draw);