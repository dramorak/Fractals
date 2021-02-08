/* dev notes 
- Might be a good idea to start using git for practice. 
Feature timeline:
	-performance improvement (for increased depth)
		- calculating object size more efficiently.
		- recasting transformation matrices using SVG matrix objects (faster multiplication times?)
		- pre-calculating depth based on operation limit, children, trunk size, then limiting depth/children. 
		- going to 30 fps
		- somehow working in web workers (multithreading)
		- bypassing coordinate transformation
		- Transformation.generateTransformation update
		- reducing complex shapes to lines in limiting cases
	- undo
	-free form drawing
	-scrolling
	-multiple fractals / supra-fractal objects
	-dedicated local storage, to save images
	-improved UI
	-reformatted HTML page

	ideas:
		images (png, jpeg, etc)
		copy clipboard
		text
		erasure
		share buttons

	bugfixes: 
		-four point start needs redoing.
		- is the branching system working properly for other shapes? 
	-*/



const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');

if(!ctx){throw '';}

var width = canvas.width = window.innerWidth;
var height = canvas.height = window.innerHeight - 72;

ctx.fillStyle = 'rgb(0,0,0)';
ctx.setTransform(1, 0, 0, -1, Math.floor(width/2) + 0.5, Math.floor(height/2) + 0.5);

// clear canvas function
function clear(){ctx.fillStyle = 'rgb(255,255,255)'; ctx.fillRect(-width/2, -height/2, width, height);}

// updates dimensions of canvas on window resize.
window.addEventListener('resize', function(){
	width = canvas.width = window.innerWidth;
	height = canvas.height = window.innerHeight - 36;
	ctx.setTransform(1, 0, 0, -1, width/2, height/2);
});

// drawing handler
function mouseup(mdEvent){
	function helper(muEvent){
		canvas.addEventListener('mousedown', mousedown);
		canvas.removeEventListener('mouseup', helper);

		var start = windowToCanvas(mdEvent);
		var end   = windowToCanvas(muEvent);

		fractal.pop();
		fractal.pushNewObject(start, end);
	}
	return helper;
}

function mousedown(e){
	if (e.button === 0){ // left mouse button
	var start = windowToCanvas(e);

	canvas.addEventListener('mouseup', mouseup(e));
	canvas.removeEventListener('mousedown', mousedown);

	fractal.pushGhostObject(start);
	}
}
canvas.addEventListener('mousedown', mousedown);


initializeMenu();
//Object renderer
objectRenderArray.push(fractal);
objectRenderArray.push(new Circle(new Point(-4,-4), new Point(4,4), 'rgb(255,127,39)'))

function render(){
	//clear
	clear();

	//draw
	objectRenderArray.forEach((obj) => obj.draw());

	//loop
	window.requestAnimationFrame(render);
}
render();