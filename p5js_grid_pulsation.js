// some experiments to have a fixed visible grid and pulsating dots on it which transform to concentric circles


let cols = 10;
let rows = 10;
let spacing = 60;

let highlights = [];
let pulseSpeed = 0.01;     // speed of each pulse
let pulseRepeats = 2;      // how many times each highlight pulses
let transitionTime = 20;   // seconds for full transformation
let startTime;

function setup() {
  createCanvas(600, 600);
  noStroke();
  startTime = millis();

  for (let i = 0; i <= cols; i++) {
    for (let j = 0; j <= rows; j++) {
      highlights.push({
        x: i * spacing,
        y: j * spacing,
        active: false,
        phase: 0,
        cycle: 0,
        alpha: 0
      });
    }
  }
}

function draw() {
  background(20);
  stroke(80);

  // Draw static grid lines
  for (let i = 0; i <= cols; i++) line(i * spacing, 0, i * spacing, height);
  for (let j = 0; j <= rows; j++) line(0, j * spacing, width, j * spacing);

  // Compute transition progress 0 → 1 over time
  let elapsed = (millis() - startTime) / 1000.0;
  let transition = constrain(elapsed / transitionTime, 0, 1);

  // Randomly activate new highlights
  if (frameCount % 20 === 0) {
    let idx = int(random(highlights.length));
    let h = highlights[idx];
    if (!h.active) {
      h.active = true;
      h.phase = 0;
      h.cycle = 0;
    }
  }

  blendMode(ADD); // additive blending for soft lights

  for (let h of highlights) {
    if (h.active) {
      h.phase += pulseSpeed;
      let s = sin(PI * h.phase); // pulse intensity 0→1→0
      h.alpha = 255 * s;

      if (h.phase >= 1) {
        h.phase = 0;
        h.cycle++;
        if (h.cycle >= pulseRepeats) {
          h.active = false;
          h.alpha = 0;
        }
      }

      // --- 1️⃣ Filled Glow (early phase) ---
      if (transition < 1.0) {
        let glowSize = 20 + 40 * s;
        let glowAlpha = (1 - transition) * h.alpha * 0.15;
        let coreAlpha = (1 - transition) * h.alpha;

        // Glow halo
        noStroke();
        fill(255, 220, 100, glowAlpha);
        ellipse(h.x, h.y, glowSize * 2, glowSize * 2);

        // Core
        fill(255, 240, 150, coreAlpha);
        ellipse(h.x, h.y, 10 + 10 * s, 10 + 10 * s);
      }

      // --- 2️⃣ Outline Rings (late phase) ---
      if (transition > 0.0) {
        let ringAlpha = transition * (h.alpha * 0.6);
        stroke(255, 220, 150, ringAlpha);
        noFill();

        let baseSize = 10 + 10 * s;
        let offset = 10 * s; // pulsating radius offset

        // three concentric rings
        ellipse(h.x, h.y, baseSize + offset);
        ellipse(h.x, h.y, baseSize + offset + 15);
        ellipse(h.x, h.y, baseSize + offset + 30);
      }
    }
  }

  blendMode(BLEND);
}
