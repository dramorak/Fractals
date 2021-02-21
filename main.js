// new main.js

/* dev notes 
- Might be a good idea to start using git for practice. 
todo:
	-performance improvement (for increased depth)
		- looking online for canvas optimizations.
	-improved UI
	-reformatted HTML page
	-change canvas cursor on grab
	- add a more complete color picker.
	bugfixes: 
		-background/draw coloring selector. need to research class precedence.
		double clicking fucks up draws? 
		releasing mouse on elements other than canvas fucks up draws.
		ghost objects stick around if they're released off canvas

	ideas:
		- coordinates
		-line thickness
		- variable background color
		- gridlines
		-gallery of drawings.
		-multiple fractals / supra-fractal objects
		-free form drawing
		images (png, jpeg, etc)
		copy clipboard
		text
		erasure
		share buttons
		Support for pixel perfect fractals? Maybe an advanced menu that lets the user create images using numeric values instead of an inexact GUI

	-*/


/* 
	- improve performance.
	- Reformat the HTML page, include all features up till now.


	- Work on blog, finish post on Y-combinator and include post about this website, including a post about this website.
	- Research about search engine optimization to increase traffic to this website.
	- Research ways to advertise website (reddit? Facebook?)
	- Research ways to monetize.
	- Make website public


	UI todo list:
		- colors
		- improved 'branch' section layout/content
		- redo header bar
   */ 

const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');

if(!ctx){throw '';}

var width = canvas.width = window.innerWidth;
var height = canvas.height = window.innerHeight - 36;

ctx.fillStyle = 'rgb(0,0,0)';
ctx.setTransform(1,0,0,-1,Math.floor(width/2), Math.floor(height/2));
// updates dimensions of canvas on window resize.
window.addEventListener('resize', function(){
	width = canvas.width = window.innerWidth;
	height = canvas.height = window.innerHeight - 36;
	canvasCenter.x = width/2;
	canvasCenter.y = height/2;
	ctx.setTransform(1, 0, 0, -1, width/2, height/2);
});

// Mouse handling.
let canvasCenter = new Point(Math.floor(width/2), Math.floor(height/2));
let scale = 1;
let inv = 1 / scale;
let x = 0;
let y = 0;
let mousedown = false;
let mouse = {
	x:0,
	y:0
}

function mousemoveHandler(e){
	if (mousedown === false){ return;}
	if(meta.style === 'grab'){
		let dx = e.clientX - x;
		let dy = e.clientY - y;

		x = e.clientX;
		y = e.clientY;

		canvasCenter.x += dx;                          
		canvasCenter.y += dy;

		ctx.setTransform(scale, 0, 0, -scale, canvasCenter.x, canvasCenter.y);
	}
}

function mouseupHandler(e){
	if (mousedown === false){
		return;
	}

	if (meta.style === "grab"){
	}else{
		fractal.pop();
		fractal.pushNewObject(new Point(x,y), windowToCanvas(e));
	}

	x = 0;
	y = 0;
	mousedown = false;
}
function mousedownHandler(e){
	if (meta.style === 'grab'){
		x = e.clientX;
		y = e.clientY;
	} else {
		let start = windowToCanvas(e);
		x = start.x;
		y = start.y;
		fractal.pushGhostObject(start);
	}
	mousedown = true;
}

function wheelHandler(e){
	e.preventDefault();

	// moves in units of 125
	// negative means the wheel has been scrolled up
	// positive means the wheel has been scrolled down.
	newScale = Math.min(Math.max(scale*(1-e.deltaY/125 * 0.25), 0.125), 5);
	newInv = 1/newScale;

	// update canvasCenter 
	canvasCenter.x = mouse.x*(1-newScale/scale) + newScale/scale*canvasCenter.x;
	canvasCenter.y = mouse.y*(1-newScale/scale) + newScale/scale*canvasCenter.y;

	// update Scale,Inv
	scale = newScale;
	inv = newInv;

	// update ctx transform attribute
	ctx.setTransform(scale, 0, 0, -scale, canvasCenter.x, canvasCenter.y)
}

function updateMouseCoords(e){
	mouse.x = e.clientX;
	mouse.y = e.clientY;
}

canvas.addEventListener('wheel', wheelHandler);
canvas.addEventListener('mousedown', mousedownHandler);
canvas.addEventListener('mouseup', mouseupHandler);
canvas.addEventListener('mousemove', mousemoveHandler);
window.addEventListener('mousemove', updateMouseCoords);

// Coordinate transformation from window to canvas.
function windowToCanvas(e){
	// inverse of canvas to window.
	return new Point(inv*(e.clientX - canvasCenter.x), -inv*(e.clientY - canvasCenter.y));
}
// clear canvas function
function clear(){ctx.fillStyle = meta.backgroundColor.toString(); ctx.fillRect(inv*(-canvasCenter.x), inv*(canvasCenter.y - height), inv*width, inv*height);}

// keyboard handlers
function keydownHandler(e){
	if (e.ctrlKey){
		if (actionObject.ctrl[e.key] !== undefined){
			actionObject.ctrl[e.key]();
		}
	} else {
		if (actionObject.noctrl[e.key] !== undefined){
			actionObject.noctrl[e.key]();
		}
	}
}
window.addEventListener('keydown', keydownHandler);


//Object renderer
objectRenderArray.push(fractal);
objectRenderArray.push(new Circle(new Transformation(10,0,0,10,0,0), 'rgb(255,127,39)'))

function render(timestamp){
	//clear
	clear();

	//draw
	objectRenderArray.forEach((obj) => obj.draw());

	//loop
	window.requestAnimationFrame(render);
}

// Final initialization.
initializeMenu();

if (startRender){ 
	render(); 
} 
if (test){
	console.log(`Total time: ${fractalDrawBenchmark()}`);
}