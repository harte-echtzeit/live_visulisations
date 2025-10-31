// === HYDRA MIDI LISTENER TEMPLATE ===

// Keep state
let midiNotes = {};      // store active notes
let lastNote = null;     // last note number
let lastVelocity = 0;    // last velocity
let lastChannel = 0;     // last MIDI channel

// === INIT MIDI ===
navigator.requestMIDIAccess().then((midiAccess) => {
  for (let input of midiAccess.inputs.values()) {
    console.log("🎹 Listening to MIDI input:", input.name);

    input.onmidimessage = (msg) => {
      const [status, note, velocity] = msg.data;
      const command = status & 0xf0;
      const channel = status & 0x0f;

      lastNote = note;
      lastVelocity = velocity;
      lastChannel = channel + 1; // channels are zero-based

      switch (command) {
        case 0x90: // Note On
          if (velocity > 0) {
            midiNotes[note] = velocity;
            handleNoteOn(note, velocity, channel);
          } else {
            delete midiNotes[note];
            handleNoteOff(note, channel);
          }
          break;

        case 0x80: // Note Off
          delete midiNotes[note];
          handleNoteOff(note, channel);
          break;

        default:
          // other message types (CC, pitchbend, etc.) can go here
          break;
      }
    };
  }
});


// === CUSTOM NOTE HANDLERS ===
function handleNoteOn(note, velocity, channel) {
  console.log(`Note ON: ${note} vel=${velocity} ch=${channel + 1}`);

  // 🔧 EXAMPLES:
  if (note === 60) {
    // Middle C: trigger a flash
    flashTrigger = 1;
  }
  if (note === 62) {
    // Change color scheme
    colorHue = Math.random();
  }
  if (note === 64) {
    // Add rotation effect
    rotationSpeed += 0.1;
  }
}

function handleNoteOff(note, channel) {
  console.log(`Note OFF: ${note} ch=${channel + 1}`);

  // You can also define note release behaviors here
  if (note === 60) flashTrigger = 0;
}


// Visual state variables
let flashTrigger = 0;
let colorHue = 0.5;
let rotationSpeed = 0;

// gradual fade-out of flash
setInterval(() => {
  flashTrigger *= 0.92;
  rotationSpeed *= 0.95;
}, 30);

osc(10, 0.2, () => 0.5 + rotationSpeed)
  .color(() => colorHue, 0.6, 1)
  .modulate(noise(3), () => flashTrigger)
  .out();
