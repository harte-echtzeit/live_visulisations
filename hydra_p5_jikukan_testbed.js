p5 = new P5()

// COLORS
let bg_color = '#0000t0'
let accent_color = '#ff8080'

// --- Toggle state variable ---
let triggerToggled = false;  // false = off, true = on

// --- Key toggle ---
p5.keyPressed = () => {
  if (p5.key === 't' || p5.key === 'T') {
    triggerToggled = !triggerToggled   // flip state
  }
}

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
  let maxCircles = 5
  let pitch = 40
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
  p5.createCanvas(1024, 1024)
  p5.noFill()
}

// --- MAIN DRAW LOOP ---
p5.draw = () => {
  p5.background(bg_color)

  // 1) Normal breathing circle
  p5.drawBreathingCircles(150, 200, 40, 2, 0.05, 0.15)

  // 2) Audio-reactive circle (from Hydra FFT bin)
  let audioLevel = a.fft[0] || 0 // normalized 0..1
  p5.drawBreathingCircles(300, 125, 50, 3, 0.08, 0.1, audioLevel, 0)

// Event-driven circle: only drawn if toggle is ON
  if (triggerToggled) {
    p5.drawBreathingCircles(850, 350, 60, 4, 0.06, 0.05, 0, 0)
  }
  
  // --- Draw trigger indicator ---
  p5.push()
  p5.fill(triggerToggled ? '#ff4040' : '#404040')
  p5.noStroke()
  p5.ellipse(30, 30, 20)  // small circle in corner indicates trigger
  p5.pop()
}


// --- HYDRA SETUP ---
s0.init({ src: p5.canvas })
src(s0).out()
