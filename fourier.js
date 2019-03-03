Math.TAU = (Math.PI * 2);

var drawScale = 1;
var isAnimating = true;
var showFPS = true;

var objCanvas = null;
var canvasControl = null;
var lastAnimationTime = -1;
var fpsNumber = 0;
var frameCount = 0;
var gameDimensions = [0, 0];
var fontSize = 0.011;
var fontStyle = "Share Tech Mono";

var rasteriseIndex = 0.0;
var circleFrequency = [];
var circleRadius = [];

// Positions of UI elements [X, Y]
var circleDrawPosition = [0.25, 0.35];
var baseGraphLocation = [0.45, 0.35];
var fpsLocation = [0, 0];
var helpLocation = [0, 0.02];
var creditLocation = [0.1, 0];

var rasteriseDistance = 0.01; // How fine is each step. The smaller the more accurate, but the longer it takes to draw.
var numberOfCircles = 2; // How many circles
var frequencyCountLimit = 5; // How many times should the waveform repeat
var wavelengthSkew = 20; // How far apart should the wavelength be (absolute pixels)
var amplitudeSkew = 1; // Increase amplitude distance (you may want to change baseGraphLocation[1] after increasing this)
var plotWidth = 8; // How big is the square on the circles
var radiusSkew = 2; // Skew the size of the circle radiuses

function init() {
  lastAnimationTime = new Date().getTime();

  objCanvas = document.getElementById("canvasDraw");
  objCanvas.imageSmoothingEnabled = true;
  canvasControl = new CanvasControl();

  objContext = canvasControl.setupCanvas(objCanvas, null, { backgroundColor: "#000000" });

  console.log("Author: Slyke (Steven Lawler)");
  console.log("Email: ");
  console.log("  steven.lawler777@gmail.com");
  console.log("Source Code: ");
  console.log("  https://github.com/Slyke/Fourier-Series");
  console.warn(" ");
  console.log("You can adjust UI Elements by entering in the variable names here.");
  console.log(" ");
  console.log("For example, entering in:");
  console.log("    numberOfCircles = 4");
  console.log("Will change how many circles are being drawn and calculated.");
  console.log(" ");
  console.log(" ");
  console.log("UI Options: ");
  console.log("  rasteriseDistance = 0.01; // How fine is each step. The smaller the more accurate, but the longer it takes to draw.");
  console.log("  numberOfCircles = 2; // How many circles");
  console.log("  frequencyCountLimit = 5; // How many times should the waveform repeat");
  console.log("  wavelengthSkew = 20; // How far apart should the wavelength be (absolute pixels)");
  console.log("  amplitudeSkew = 1; // Increase amplitude distance (you may want to change baseGraphLocation[1] after increasing this)");
  console.log("  plotWidth = 8; // How big is the square on the circles");
  console.log("  radiusSkew = 2; // Skew the size of the circle radiuses");
  console.log(" ");
  console.log(" ");
  console.log("Useful UI Element Locations: ");
  console.log("  circleDrawPosition = [0.25, 0.35]");
  console.log("  baseGraphLocation = [0.45, 0.35]");

  calculateSize();

  setupEventHandlers(objCanvas, canvasControl);
  gameDimensions = [objCanvas.width, objCanvas.height];

  animateLoop();
};

function animateLoop() {
  var currentTime = new Date().getTime();
  var timeDiff = ((currentTime - lastAnimationTime) / 1000);

  frameCount++;

  if (frameCount > 5) {
    frameCount = 0;
    fpsNumber = Math.round((1 / timeDiff), 1);
  }
  
  calculateFontSize();
  calculateNextFrame(timeDiff);

  if (isAnimating) {
    requestAnimationFrame(() => { animateLoop(); });
  }

  this.lastAnimationTime = currentTime;
  canvasControl.refreshScreen(false);
}

function calculateNextFrame(timeDiff) {
  canvasControl.canvasObjects = [];

  if (showFPS) {
    var lblFPS = {
      "x": relToAbs(fpsLocation[0], 0),
      "y": relToAbs(fpsLocation[1], 1),
      "name":"lblFPS",
      "text":"FPS: " + fpsNumber,
      "shape":"text",
      "render":function(self) {
        canvasControl.drawText(self.x, self.y, self.text, self, null, null, {"fillStyle":"#99FF00"});
      },
      "visible":true
    };

    canvasControl.canvasObjects.push(lblFPS);
  }

  var lblHelp = {
    "x": relToAbs(helpLocation[0], 0),
    "y": relToAbs(helpLocation[1], 1),
    "name":"lblhelp",
    "text":"Check Javascript console for changing UI elements and source code url.",
    "shape":"text",
    "render":function(self) {
      canvasControl.drawText(self.x, self.y, self.text, self, null, null, {"fillStyle":"#99FF00"});
    },
    "visible":true
  };
  canvasControl.canvasObjects.push(lblHelp);

  for (var i = 0; i < numberOfCircles; i++) {
    circleFrequency[i] = 2 * (i + 1) - 1;
    circleRadius[i] = (120 / circleFrequency[i]) * radiusSkew;
  }

  if (rasteriseIndex > frequencyCountLimit * Math.TAU) {
    rasteriseIndex = 0;
  } else {
    rasteriseIndex += rasteriseDistance
  }

  var circleX = 0;
  var circleY = 0;

  for (var i = 0; i < numberOfCircles; i++) {
    function addCircle(j) {
      var newCircle = {
        "x": circleX + relToAbs(circleDrawPosition[0], 0),
        "y": circleY + relToAbs(circleDrawPosition[1], 1),
        "r": Math.abs(circleRadius[i]),
        "s": null,
        "f": null,
        "shape": "arc",
        "renderType": function() { canvasControl.canvasContext.stroke(); },
        // "renderType": function(){ canvasControl.canvasContext.fill(); canvasControl.canvasContext.stroke(); },
        "render": function(self) {
          canvasControl.drawArc(self.x, self.y, self.r, self.s, self.f, self.renderType, canvasControl.canvasContext, {"fillStyle":"#8ED6FF", "strokeStyle": rainbow(numberOfCircles, j), "lineWidth":"1"} );
        },
        "visible":true
      };
      canvasControl.canvasObjects.push(newCircle);
    }

    addCircle(i);

    circleX += circleRadius[i] * Math.cos(circleFrequency[i] * rasteriseIndex);
    circleY += circleRadius[i] * Math.sin(circleFrequency[i] * rasteriseIndex);
  }

  var newPlotCircle = {
    "x": (circleX - (plotWidth / 2)) + relToAbs(circleDrawPosition[0], 0),
    "y": (circleY - (plotWidth / 2)) + relToAbs(circleDrawPosition[1], 1),
    "w": plotWidth,
    "h": plotWidth,
    "shape":"rect",
    "renderType": function() { canvasControl.canvasContext.fill(); canvasControl.canvasContext.stroke(); },
    "render":function(self) {
      canvasControl.drawRect(self.x, self.y, self.w, self.h, self.renderType, canvasControl.canvasContext, {"fillStyle":"#000000", "strokeStyle": "#FFFFFF", "lineWidth":"1"} );
    },
    "visible":true
  };

  for (var i = 0; i < rasteriseIndex; i += rasteriseDistance) {

    var newcircleY = (j) => {
      var latestYPos = 0;
      var secondLatestYPos = 0;
      for (var k = 0; k < numberOfCircles; k++) {
        latestYPos += circleRadius[k] * Math.sin(circleFrequency[k] * j);
        secondLatestYPos += (circleRadius[k] * Math.sin(circleFrequency[k] * (j - rasteriseDistance)));
      }
      return [latestYPos, secondLatestYPos];
    }

    var newY = newcircleY(i);
    
    var newPlotPoint = {
      "x1": (i * wavelengthSkew) + relToAbs(baseGraphLocation[0], 0),
      "y1": (newY[0] * amplitudeSkew) + relToAbs(baseGraphLocation[1], 1),
      "x2": ((i - rasteriseDistance) * wavelengthSkew) + relToAbs(baseGraphLocation[0], 0),
      "y2": (newY[1] * amplitudeSkew) + relToAbs(baseGraphLocation[1], 1),
      "shape":"line",
      "render":function(self) {
        canvasControl.drawLine(self.x1, self.y1, self.x2, self.y2, canvasControl.canvasContext, {"strokeStyle": "#77FF00", "lineWidth":"1"} );
      },
      "visible":true
    };

    canvasControl.canvasObjects.push(newPlotPoint);
  }

  
  canvasControl.canvasObjects.push(newPlotCircle);

}

function relToAbs(relCoord, dimension) {
  return (relCoord * (dimension === 0 ? objCanvas.width : objCanvas.height));
}

function randomNumber(lowerNumber, higherNumber) {
  return Math.floor(Math.random() * higherNumber) + lowerNumber;
}

function calculateFontSize() {
  canvasControl.canvasContext.font = (relToAbs(fontSize, 1) * drawScale) + 'px ' + fontStyle;
}

function setupEventHandlers(objCanvas, canvasControl) {
  // None
}

function calculateSize() {
  objCanvas.width = document.documentElement.clientWidth;
  objCanvas.height = document.documentElement.clientHeight;
}

function pad(str, size, withChar = "0") {
  var s = str + "";
  while (s.length < size) s = withChar + s;
  return s;
}

function rainbow(numOfSteps, step) {
  // This function generates vibrant, "evenly spaced" colours (i.e. no clustering). This is ideal for creating easily distinguishable vibrant markers in Google Maps and other apps.
  // Adam Cole, 2011-Sept-14
  // HSV to RBG adapted from: http://mjijackson.com/2008/02/rgb-to-hsl-and-rgb-to-hsv-color-model-conversion-algorithms-in-javascript
  var r, g, b;
  var h = step / numOfSteps;
  var i = ~~(h * 6);
  var f = h * 6 - i;
  var q = 1 - f;
  switch(i % 6){
      case 0: r = 1; g = f; b = 0; break;
      case 1: r = q; g = 1; b = 0; break;
      case 2: r = 0; g = 1; b = f; break;
      case 3: r = 0; g = q; b = 1; break;
      case 4: r = f; g = 0; b = 1; break;
      case 5: r = 1; g = 0; b = q; break;
  }
  var c = "#" + ("00" + (~ ~(r * 255)).toString(16)).slice(-2) + ("00" + (~ ~(g * 255)).toString(16)).slice(-2) + ("00" + (~ ~(b * 255)).toString(16)).slice(-2);
  return (c);
}