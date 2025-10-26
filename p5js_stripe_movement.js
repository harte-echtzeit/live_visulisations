// a testbed for animating stripes with background concentric circles

let w = 600;
let h = 600;

let baseWidth = 5;    // average stripe width
let pitch = 5;
let spacing = baseWidth + pitch;
let itr = 0;
let step = 1;          // pixels per frame
let speed = 0.5;       // multiplier for overall speed
let modDensity = 0.2;  // strength of width modulation = density of grid (higher = more dense)
let modSpeed = 0.5;      // divider for speed of modulation (lower = faster)

// colors
let bg_color = '#00000';
let accent_color = '#ff8080';
let fill_color = '#214478';

// circle locations
let coordX = 300;
let coordY = 125;
let dia_start = 25;

function drawBreathingCircles(x, y, minDia, strokeW, speed, pauseRatio = 0.2, time) {
  push();
  stroke(accent_color);
  strokeWeight(strokeW);
  noFill();
let t = time * speed;
  // --- phase control with pause ---
  // total cycle: grow → pause → shrink → pause
  // map to [0,1] for growth, with pauses controlled by pauseRatio
  let cycle = t % 1.0; // one full normalized cycle
  let activeRange = 1 - 2 * pauseRatio;
  let phase;

  if (cycle < activeRange / 2) {
    // growth phase
    phase = cycle / (activeRange / 2);
  } else if (cycle < activeRange / 2 + pauseRatio) {
    // top pause
    phase = 1;
  } else if (cycle < activeRange + pauseRatio) {
    // collapse
    phase = 1 - ((cycle - (activeRange / 2 + pauseRatio)) / (activeRange / 2));
  } else {
    // bottom pause
    phase = 0;
  }

  // parameters for the circle system
  let maxCircles = 7;
  let pitch = 25;

  // smooth ease curve
  let systemGrowth = 0.5 - 0.5 * cos(phase * PI);

  // cascading circle diameters
  let diameters = [];
  diameters[0] = minDia;

  for (let i = 1; i < maxCircles; i++) {
    let localPhase = constrain(systemGrowth * (maxCircles) - i, 0, 1);
    let localGrowth = 0.5 - 0.5 * cos(localPhase * PI);
    diameters[i] = diameters[i - 1] + pitch * localGrowth;
  }

  // draw circles
  for (let i = 0; i < maxCircles; i++) {
    if (diameters[i] > minDia + 0.1) {
      circle(x, y, diameters[i]);
    }
  }

  pop();
}




function setup() {
  createCanvas(w, h);
  noFill();
  frameRate(60);
}

function draw() {
  background(bg_color);
  
  let t = millis() * 0.001; // time in seconds

	  // multiple independent circle groups
  drawBreathingCircles(150, 200, 15, 7.5, 0.05, 0.05, t);  // slow, thin lines
  drawBreathingCircles(450, 350, 15, 5, 0.06, 0.05, t);  // slightly faster
  drawBreathingCircles(300, 125, 20, 5, 0.04, 0.051, t);   // your original one


  // --- draw moving grid on top ---
  stroke(fill_color);
  let stripeWidth = baseWidth * (1.0 + modDensity * sin(t / modSpeed));
  strokeWeight(stripeWidth);

  itr = (itr + step * speed) % spacing;
  let cols = ceil(width / spacing) + 2;

  for (let i = -1; i <= cols; i++) {
    let x = i * spacing + itr;
    line(x, 0, x, height);
  }
}
