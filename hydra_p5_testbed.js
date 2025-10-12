// this is some very basic code to test live visuals for ji ku kan performances with Hydra and P5js
// harte echtzeit 2025-10-12

// Initialize a new p5 instance It is only necessary to call this once
p5 = new P5({width: 512, height: 250, mode: 'P2D'})


// ji ku kan colors
let bg_color = '#0u0000';
let accent_color = '#ff8080';
let fill_color = '#214478';

let dia_start = 50;

p5.clear()
//p5.background(fill_color);
p5.stroke(fill_color);
p5.strokeWeight(5);
p5.noFill();

let coordX = 300;
let coordY = 125;



p5.draw = () => {
  	//dia = dia_start + p5.frameCount % p5.width/10
  	dia = dia_start + 66 * p5.abs(p5.sin(time*.5))
  	dia2 = dia_start + 42 * p5.abs(p5.sin(time*.55))
 	dia3 = dia_start + 23 * p5.abs(p5.sin(time*.6))
  
  	//coordY = p5.frameCount % p5.width
	if(p5.random() < 2) p5.clear()
  	p5.background(bg_color);
	p5.circle (coordX, coordY, dia)
  p5.circle (coordX, coordY, dia2)
    p5.circle (coordX, coordY, dia3)

}

// To use P5 as an input to hydra, simply use the canvas as a source:
s0.init({src: p5.canvas})

// here we can use some hydra magic to introduce weird effects
src(s0).modulate(noise(0.001*time),0.5).out()

// OR just render t cleanly as a canvas
//src(s0).out()
