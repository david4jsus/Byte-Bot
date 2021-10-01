//== GLOBAL VARIABLES ==\\

var socket = io(); // Socket.io library

var canvas; // Canvas drawing object
var ctx;    // Canvas drawing context

var previousTimestamp; // Timestamp of the previous rendered frame
var currentTimestamp;  // Timestamp of the current frame being rendered

var delayTimer;        // Time in seconds for the delay to last before starting the "loading" screen
var currentDelayTimer; // Time in seconds going up while delay is going

var loadingMessages; // Messages to show while "loading"
var loadingTimer;    // Time in minutes for the "loading" screen to last
var currentTimer;    // Time in seconds going up while "loading" screen is going
var targetTimer;     // The target time to wait for (used after "loading bar" had "loaded")

var timeSections;           // Sections of time where the loading bar will load at independent speeds
var timeSectionMultipliers; // Time multipliers for each sections
var timeSectionThresholds;  // Time at which the loading bar will transition to the next section
var currentTimeSection;     // Current loading bar section

var screenStates;       // Possible states for the "loading" screen
var currentScreenState; // Current state for the "loading" screen

var logo_graphic;            // Frames that make up the logo graphic sequence
var currentLogoGraphicFrame; // The current logo graphic frame to draw

var command_ready; // Whether the bot is ready to receive the start command

//== FUNCTIONS ==\\

// Initialize important variables
function Init() {
    
    // Initialize global variables
    canvas = document.querySelector ("canvas");
    ctx = canvas.getContext ("2d");
    
    previousTimestamp = currentTimestamp = Date.now();

    delayTimer = 10;
    currentDelayTimer = 0;
    
    loadingMessages = [
        "Initializing stream",
        "Initializing stream.",
        "Initializing stream..",
        "Initializing stream...",
        "Interfacing with Twitch",
        "Interfacing with Twitch.",
        "Interfacing with Twitch..",
        "Interfacing with Twitch...",
        "Loading widgets",
        "Loading widgets.",
        "Loading widgets..",
        "Loading widgets...",
        "Waking up master AI",
        "Waking up master AI.",
        "Waking up master AI..",
        "Waking up master AI...",
        "Stabilizing inter-dimensional portals",
        "Stabilizing inter-dimensional portals.",
        "Stabilizing inter-dimensional portals..",
        "Stabilizing inter-dimensional portals...",
        "Scratching my nose for a bit",
        "Scratching my nose for a bit.",
        "Scratching my nose for a bit..",
        "Scratching my nose for a bit...",
        "Clearing non-euclidean spaces",
        "Clearing non-euclidean spaces.",
        "Clearing non-euclidean spaces..",
        "Clearing non-euclidean spaces...",
        "Removing flopping Magikarps",
        "Removing flopping Magikarps.",
        "Removing flopping Magikarps..",
        "Removing flopping Magikarps...",
        "Finalizing",
        "Finalizing.",
        "Finalizing..",
        "Finalizing...",
    ];
    loadingTimer = 2;
    currentTimer = 0;
    targetTimer = 0;

    getTimeSections();           // Calculate time sections
    getTimeSectionMultipliers(); // Calculate time multipliers for each section
    getTimeSectionThresholds();  // Calculate times at which sections transition
    currentTimeSection = 0;      // Set current time section
    
    screenStates = [
        "loading",
        "loaded",
    ];
    currentScreenState = 0;

    populateLogoGraphicVariable(); // Reference the logo graphic frames

    command_ready = false;
    
    // Adjust resolution of the canvas object
    Resize();
    
    // Set page event listeners
    window.addEventListener ("resize", Resize);
    
    // Start main logic loop
    Tick();
}

// Adjust the resolution of the canvas object every time the page changes size
function Resize() {
    
    // Make the canvas object's width and height that of the page's
    canvas.width = document.body.clientWidth;
    canvas.height = document.body.clientHeight;
}

// Main logic loop
function Tick() {
    
    // Calculate delta time
    previousTimestamp = currentTimestamp;
    currentTimestamp = Date.now();
    let dt = currentTimestamp - previousTimestamp;
    
    // Update logic
    Logic (dt);
    
    // Draw on the screen
    Draw (dt);
    
    requestAnimationFrame (Tick);
}

// Logic goes here
function Logic (dt) {
    
    // Calculate logic depending on the current screen state
    switch (currentScreenState) {
        case 0: // Delay

            // Timer logic
            currentDelayTimer += dt * 0.001;

            // Check delay is done
            if (currentDelayTimer >= delayTimer) {
                currentDelayTimer = delayTimer;
                currentScreenState = 1;
                
                let audio = new Audio("/assets/Intro.mp3");
                audio.play();
            }

            break;

        case 1: // "Loading" screen
            
            // Timer logic
            let multiplier = timeSectionMultipliers[currentTimeSection];
            currentTimer += dt * 0.001 * multiplier;

            // Check transitioning to next timing section
            if (currentTimer >= timeSectionThresholds[currentTimeSection]) {
                currentTimeSection++;
            }
            
            // Check "loading bar" is done "loading"
            if (currentTimer >= loadingTimer * 60) {
                currentTimer = 0;
                targetTimer = 3;
                currentScreenState = 2;
            }
            
            break;
            
        case 2: // Transition to audio check

            // Timer logic
            currentTimer += dt * 0.001;

            // Check transition to next screen
            if (currentTimer >= targetTimer) {
                currentTimer = 0;
                targetTimer = 0;
                command_ready = true;
                currentScreenState++;
            }
            
            break;
        
        case 3: // Welcome screen

            // Logic for drawing the logo graphic
            currentLogoGraphicFrame++;
            if (currentLogoGraphicFrame >= logo_graphic.length) {
                currentLogoGraphicFrame = 0;
            }

            break;
    }
    
}

// Draw thinigs on the screen
function Draw (dt) {
    
    // Clear the screen
    ctx.clearRect (0, 0, canvas.width, canvas.height);
    
    // Draw depending on the current screen state
    switch (currentScreenState) {
        case 0: // Delay

            // Background
            ctx.fillStyle = "#FFFFFF";
            ctx.fillRect (0, 0, canvas.width, canvas.height);

            break;

        case 1: // "Loading" screen
            
            // Variables
            let percentLoaded = currentTimer / (loadingTimer * 60);

            // Background
            ctx.fillStyle = "rgba(255, 255, 255, " + (1 - percentLoaded).toFixed (2) + ")";
            ctx.fillRect (0, 0, canvas.width, canvas.height);
            
            // Loading percent text background
            let percentBG = ctx.createRadialGradient (canvas.width / 2, canvas.height / 7 * 3, 0, canvas.width / 2, canvas.height / 7 * 3, 250);
            percentBG.addColorStop (0.8, "rgba(255, 255, 255, 1)");
            percentBG.addColorStop (1, "rgba(255, 255, 255, 0)");

            ctx.fillStyle = percentBG;
            ctx.beginPath();
            ctx.arc (canvas.width / 2, canvas.height / 7 * 3, 250, 0, 2 * Math.PI);
            ctx.fill();

            // Loading percent text
            let percentText = (percentLoaded * 100).toFixed (2) + "%";
            
            ctx.fillStyle = "#000000";
            ctx.font = "bold 80px Share Tech Mono";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText (percentText, canvas.width / 2, canvas.height / 7 * 3);
            
            // Loading circle
            ctx.strokeStyle = "#00FF00";
            ctx.lineWidth = 20;
            ctx.beginPath();
            ctx.arc (canvas.width / 2, canvas.height / 7 * 3, 200, 0, 2 * Math.PI * percentLoaded);
            ctx.stroke();
            
            // "Loading" text
            let currentTextIndex = Math.floor (currentTimer * loadingMessages.length / (loadingTimer * 60));
            let loadingText = loadingMessages[currentTextIndex];
            
            ctx.fillStyle = "#000000";
            ctx.font = "bold 60px Share Tech Mono";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText (loadingText, canvas.width / 2, canvas.height / 7 * 5);
            
            break;
            
        case 2: // Transition to audio check
            
            // Loading percent text background
            let pcBG = ctx.createRadialGradient (canvas.width / 2, canvas.height / 7 * 3, 0, canvas.width / 2, canvas.height / 7 * 3, 250);
            pcBG.addColorStop (0.8, "rgba(255, 255, 255, 1)");
            pcBG.addColorStop (1, "rgba(255, 255, 255, 0)");

            ctx.fillStyle = pcBG;
            ctx.beginPath();
            ctx.arc (canvas.width / 2, canvas.height / 7 * 3, 250, 0, 2 * Math.PI);
            ctx.fill();

            // Loading percent text
            ctx.fillStyle = "#000000";
            ctx.font = "bold 80px Share Tech Mono";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText ("100.00%", canvas.width / 2, canvas.height / 7 * 3);
            
            // Loading circle
            ctx.strokeStyle = "#00FF00";
            ctx.lineWidth = 20;
            ctx.beginPath();
            ctx.arc (canvas.width / 2, canvas.height / 7 * 3, 200, 0, 2 * Math.PI);
            ctx.stroke();
            
            // "Loading" text
            ctx.fillStyle = "#000000";
            ctx.font = "bold 60px Share Tech Mono";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText ("Ready", canvas.width / 2, canvas.height / 7 * 5);

            // Fade to black
            ctx.fillStyle = "rgba(0, 0, 0, " + (currentTimer/targetTimer).toFixed(2) + ")";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            break;

        case 3: // Welcome screen

            /*
            // "Welcome" text
            let welcomeText = "Welcome!";
            
            ctx.fillStyle = "#FF5E00";
            ctx.strokeStyle = "#000000";
            ctx.lineWidth = 10;
            ctx.font = "bold 180px Orbitron";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.strokeText (welcomeText, canvas.width / 2, canvas.height / 3);
            ctx.fillText (welcomeText, canvas.width / 2, canvas.height / 3);
            */

            // Background
            ctx.fillStyle = "#000000";
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Logo graphic
            let logoWidth = 480;
            let logoHeight = logoWidth * 16 / 9;
            ctx.drawImage(logo_graphic[currentLogoGraphicFrame], 0, 0, 1920, 1080, (canvas.width / 2) - logoWidth, (canvas.height / 10), logoHeight, logoWidth);
            
            // "Press any key to continue" text
            //let continueText = "Type !startstream to start...";
            let continueText = "Welcome to the stream!";
            
            ctx.fillStyle = "#FFFFFF";
            ctx.strokeStyle = "#000000";
            ctx.lineWidth = 5;
            ctx.font = "italic bold 74px Orbitron";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.strokeText (continueText, canvas.width / 2, canvas.height / 3 * 2);
            ctx.fillText (continueText, canvas.width / 2, canvas.height / 3 * 2);

            break;
    }
}

// Calculate loading bar timing sections
function getTimeSections() {

   // Initialize sections
   timeSections = [];
   let target = loadingTimer * 60;

   // Initialize variables
   let numSections = Math.ceil(Math.random() * (target / 2) + 1); // The randomized number of sections
   let left = target;                                             // Amount left still unassigned
   let max = Math.ceil(target/numSections);                       // Max amount that a section can get

   // Calculate sections
   for (let i = 0; i < numSections; i++) {
        // If this is the last section, use up what's left from the total
        if (i == numSections - 1) {
            timeSections[i] = left;
        }
        // Otherwise, assign to this section a random amount
        else {
            timeSections[i] = Math.ceil(Math.random() * max);
            left -= timeSections[i];
            max = Math.min(Math.ceil(left / 2), Math.ceil(target/numSections));
        }
   }

   // Debug
   /*console.log(timeSections);
   let total = 0; for(let i = 0; i < timeSections.length; i++) {total += timeSections[i];}
   console.log(total);*/
}

// Calculate time multipliers for each timing section
function getTimeSectionMultipliers() {

    // Initialize multipliers
    timeSectionMultipliers = [];
    let target = loadingTimer * 60;

    // Calculate normalized multiplier
    let normalizedMultiplier = target / timeSections.length;

    // Calculate multipliers based on calculated sections
    for (let i = 0; i < timeSections.length; i++) {
        timeSectionMultipliers[i] = timeSections[i]/normalizedMultiplier;
    }

   // Debug
   //console.log(timeSectionMultipliers);
}

// Calculate at which point in the loading bar a section transitions to the next
function getTimeSectionThresholds() {

    // Initialize variables
    timeSectionThresholds = [];
    let total = 0;

    // Cycle through calculate sections
    for (let i = 0; i < timeSections.length; i++) {
        total += timeSections[i];
        timeSectionThresholds[i] = total;
    }

   // Debug
   //console.log(timeSectionThresholds);
}

// Send the signal to start the stream
function startStream() {

    // Send signal through socket.io
    socket.emit("start_stream_signal");
}

// Receive start stream command
socket.on('start_stream_command', () => {

    // Check whether we can send the signal to start the stream
    if (command_ready) {

        //Send the signal
        startStream();
    }
});

// Reference the logo graphic frames
function populateLogoGraphicVariable() {

    // Reset the variable
    logo_graphic = [];

    // Name of the file
    let filename = "/assets/logo_graphic/logo4-";

    // Number of frames
    let numFrames = 900;

    // Populate the array with the filenames
    for (let i = 1; i <= numFrames; i++) {
        let numText = i.toString();
        if (numText.length == 1) numText = "0" + numText;
        if (numText.length == 2) numText = "0" + numText;
        if (numText.length == 3) numText = "0" + numText;
        let file = filename + numText + ".png";
        let img = new Image();
        img.src = file;
        logo_graphic[i - 1] = img;
    }

    // Set first frame
    currentLogoGraphicFrame = 0;
}

//== MAIN ==\\

Init();