p5 = new P5()

// geometric params
let lineWidth = 10

let baseWidth = lineWidth;    // average stripe width
let pitch = lineWidth;
let spacing = baseWidth + pitch;
let itr = 0;
let step = 5;          // pixels per frame
let speed = 0.05;       // multiplier for overall speed
let modDensity = 0.1;  // strength of width modulation = density of grid (higher = more dense)
let modSpeed = 0.9;      // divider for speed of modulation (lower = faster)


// COLORS
let bg_color = '#0000t0'
let accent_color = '#ff8080'
let fill_color = '#214478';

// --- Toggle state variable ---
let triggerToggled = false;  // false = off, true = on

// --- Key toggle ---
p5.keyPressed = () => {
  if (p5.key === 't' || p5.key === 'T') {
    triggerToggled = !triggerToggled   // flip state
  }
}



///// EXPERIMENTAL MIDI TRIGGER

let trigger = 0;

navigator.requestMIDIAccess().then((midiAccess) => {
  for (let input of midiAccess.inputs.values()) {
    input.onmidimessage = (msg) => {
      const [status, note, velocity] = msg.data;
      const cmd = status & 0xf0;
      if (cmd === 0x90 && velocity > 0) trigger = 1;
    };
  }
});

// Slowly decay trigger to 0 over time
setInterval(() => trigger *= 0.95, 30);



// --- DRAWING FUNCTION (reusable circle group) ---
p5.drawBreathingCircles = function (x, y, minDia, strokeW, speed, pauseRatio = 0.2, reactiveAudio = 0, trigger = 0) {
  p5.push()
  p5.stroke(accent_color)
  p5.strokeWeight(strokeW)
  p5.noFill()

  // time with speed scaling
  let t = p5.millis() * 0.001 * speed

  // restart growth if triggered
  if (trigger > 0) t = 0

  // include audio modulation on one circle
  let audioMod = reactiveAudio * 0.5 // scale audio to influence growth
  let phaseRaw = (t + audioMod) % 1.0

  // normalize phase with pauses
  let activeRange = 1 - 2 * pauseRatio
  let phase
  if (phaseRaw < activeRange / 2) phase = phaseRaw / (activeRange / 2)
  else if (phaseRaw < activeRange / 2 + pauseRatio) phase = 1
  else if (phaseRaw < activeRange + pauseRatio) phase = 1 - ((phaseRaw - (activeRange / 2 + pauseRatio)) / (activeRange / 2))
  else phase = 0

  // circle system
  let maxCircles = 9
  let pitch = 30
  let systemGrowth = 0.5 - 0.5 * p5.cos(phase * p5.PI)
  let diameters = []
  diameters[0] = minDia

  for (let i = 1; i < maxCircles; i++) {
    let localPhase = p5.constrain(systemGrowth * maxCircles - i, 0, 1)
    let localGrowth = 0.5 - 0.5 * p5.cos(localPhase * p5.PI)
    diameters[i] = diameters[i - 1] + pitch * localGrowth
  }

  for (let i = 0; i < maxCircles; i++) {
    if (diameters[i] > minDia + 0.1) p5.circle(x, y, diameters[i])
  }

  p5.pop()
}

// --- P5 SETUP ---
p5.setup = () => {
  p5.createCanvas(p5.width, p5.height)
  p5.noFill()
  p5.frameRate(60)
}

// --- MAIN DRAW LOOP ---
p5.draw = () => {
  p5.background(bg_color)

  // 1) Normal breathing circle
  p5.drawBreathingCircles(850, 200, 40, lineWidth, 0.025, 0.15)

  // 2) Audio-reactive circle (from Hydra FFT bin)
  let audioLevel = a.fft[0] || 0 // normalized 0..1
  p5.drawBreathingCircles(750, 525, 50, lineWidth, 0.02, 0.1, audioLevel, 0)

// Event-driven circle: only drawn if toggle is ON
  if (triggerToggled) {
    p5.drawBreathingCircles(850, 350, 60, lineWidth, 0.02, 0.05, 0, 0)
  }
  
  // --- Draw trigger indicator ---
  p5.push()
  p5.fill(triggerToggled ? '#ff4040' : '#404040')
  p5.noStroke()
  p5.ellipse(30, 30, 20)  // small circle in corner indicates trigger
    p5.pop()


  // --- draw moving grid on top ---
  p5.push();
  p5.stroke(fill_color);
  let t = p5.millis() * 0.001 // time in seconds
  let stripeWidth = baseWidth * (1.0 + modDensity * p5.sin(t / modSpeed));
  p5.strokeWeight(stripeWidth);

  itr = (itr + step * speed) % spacing;
  let cols = p5.ceil(width / spacing) + 2;

  for (let i = -1; i <= cols; i++) {
    let x = i * spacing + itr
    p5.line(x, 0, x, height)    
  }
  p5.pop();

}


// --- HYDRA SETUP ---
s0.init({ src: p5.canvas })
//src(s0).out()

// Slowly decay trigger to 0 over time
setInterval(() => trigger *= 1.0, 150);

// here we can use some hydra magic to introduce weird effects - with or without MIDI trigger
// src(s0).modulate(noise(1), () => trigger * 0.1).out()
src(s0).modulate(noise(1), osc(2)).out()

