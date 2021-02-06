/* dev notes 
- Might be a good idea to start using git for practice. 
Feature timeline:
	-performance improvement (for increased depth)
		- calculating object size more efficiently.
		- recasting transformation matrices using SVG matrix objects (faster multiplication times?)
		- pre-calculating depth based on operation limit, children, trunk size
		- going to 30 fps
		- somehow working in web workers (multithreading)
		- bypassing coordinate transformation
		- Transformation.generateTransformation update
	-new shapes
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
	-*/



const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');


var width = canvas.width = window.innerWidth;
var height = canvas.height = window.innerHeight - 72;
var unit = 100; // 1 unit is defined as 100 pixels.
var operationLimit = 100000; //rough estimate on the number of operations that can be done in under 16 milliseconds.

var sin = Math.sin;
var cos = Math.cos;

var fractal = {
	trunk: [],
	children: [],
	draw: function(){

		function helper(d, objArray){
			// filter objArray, discluding small objects
			objArray = filter(objArray, (obj) => obj.size > 2);

			if( d === meta.maxDepth || !objArray){
				return;
			}

			let temp = [];
			// draw the elements of obj array, fill temp
			for(var i = 0; i < objArray.length; i++){
				objArray[i].draw();
			}
			// iterate over transformation array
			for (var j = 0; j<fractal.children.length; j++){
			//	for each, apply the transformation to a copy of objArray and recursively call helper.
				let trans = fractal.children[j].transformation;
				objArray.forEach((obj, idx) => temp[idx] = trans.apply(objArray[idx]));
				helper(d + 1, temp);
			}
		}
		helper(0, fractal.trunk);
	},
	pushNewObject : function(start, end){
		if(meta.style === "line"){
			fractal.trunk.push( new Line(start, end));
		} else if (meta.style === "branch"){
			fractal.children.push(new Branch(start, end));
		}
	},
	pushGhostObject : function(start){
		//Adds an object who's end point is determined dynamically by mouse position.

		if (meta.style === 'branch'){
			// adds three objects: A line, displaying the orientation, a circle, displaying the magnitude, and a child node.
			var displayCircle = new Circle({x:start.x - unit, y:start.y-unit}, {x:start.x+unit, y:start.y+unit}, 'rgb(255,127,39)');
			var displayLine = new Line(start, start, 'rgb(255,127,39)');
			var branch = new Branch(start, start);

			fractal.updater = function(e){
				var end = windowToCanvas(e);

				branch.transformation = Transformation.generateTransformation(start, end);
				displayLine.end = end;
			}
			window.addEventListener('mousemove', fractal.updater);

			fractal.children.push(branch);
			objectRenderArray.push(displayLine);
			objectRenderArray.push(displayCircle);

		} else {
			var line = new Line(start, {x:start.x, y:start.y});
			fractal.updater = function(e){
				var end = windowToCanvas(e);
				line.end = end;
				line.size = ((start.x - end.x) ** 2 + (start.y - end.y)**2)**(0.5);
			}
			window.addEventListener('mousemove', fractal.updater);
			fractal.trunk.push(line)
		}
	},
	pop : function(){
		window.removeEventListener('mousemove', fractal.updater);
		if (meta.style === "line"){fractal.trunk.pop();}
		if (meta.style === "branch"){fractal.children.pop(); objectRenderArray.pop(); objectRenderArray.pop();}
	},
	updater : function(){}
}

var objectRenderArray = [];

var meta = { // stores relevant information about the current drawstyle.
	maxDepth : 11,
	style : "line",
	thickness : 1
}

function Point(x,y){
	this.x = x;
	this.y = y;
}

function Vector(x,y){
	this.x = x;
	this.y = y;
}

function Line(start, end,color="rgb(0,0,0)"){
	this.start = start;
	this.end = end;
	this.size = ((start.x-end.x)**2 + (start.y-end.y)**2)**(0.5);
	this.draw = function(){
		ctx.strokeStyle=color;
		ctx.beginPath();
		ctx.moveTo(this.start.x,this.start.y);
		ctx.lineTo(this.end.x,this.end.y);
		ctx.stroke();
	}
}

function Circle(start, end, color="rgb(0,0,0)"){
	this.start = start;
	this.end   = end;
	this.center = {
		x: Math.floor((this.start.x + this.end.x) / 2),
		y: Math.floor((this.start.y + this.end.y) / 2)
		};

	this.size = 0.5 * Math.min(Math.abs(this.end.x - this.start.x), Math.abs(this.end.y - this.start.y)) ;

	this.draw = function(){
		ctx.strokeStyle=color;
		ctx.beginPath();
		ctx.arc(this.center.x, this.center.y, this.size, 0, 2* Math.PI);
		ctx.stroke();
		ctx.fillStyle = 'rgb(0,0,0)';
	}
}

function Branch(start, end){
	this.start = start;
	this.end = end;
	this.transformation = Transformation.generateTransformation(this.start, this.end);
}

function Transformation(a,b,c,d,e,f){
	// matrix notation for a linear transformation
	// if a vector is expressed as (x,y,1), the Transformation is equivalent to the matrix:
	// ( a c e )
	// ( b d f )

	// interpretation:
	// a = horizontal scaling
	// b = vertical skewing
	// c = horizontal skewing
	// d = vertical scaling
	// e = horizontal translation
	// f = vertical translation

	this.a = a;
	this.b = b;
	this.c = c;
	this.d = d;
	this.e = e;
	this.f = f;
}
Transformation.prototype.apply = function(operand){
	if(operand instanceof Transformation){
		var a0 = operand.a;
		var b0 = operand.b;
		var c0 = operand.c;
		var d0 = operand.d;
		var e0 = operand.e;
		var f0 = operand.f;

		var a = this.a * a0 + this.c * b0;
		var b = this.b * a0 + this.d * b0;
		var c = this.a * c0 + this.c * d0;
		var d = this.b * c0 + this.d * d0;
		var e = this.a * e0 + this.c * f0 + this.e;
		var f = this.b * e0 + this.d * f0 + this.f;

		return new Transformation(a,b,c,d,e,f);
	}else if(operand instanceof Vector){
		var x = operand.x;
		var y = operand.y;
		return new Vector(this.a * x + this.c * y + this.e, this.d*y + this.b*x + this.f);
	}else if(operand instanceof Point){
		var x = operand.x;
		var y = operand.y;
		return new Vector(this.a * x + this.c * y + this.e, this.d*y + this.b*x + this.f);
	} else if(operand instanceof Line){
		return new Line(this.apply(operand.start), this.apply(operand.end));
	} else if(operand instanceof Circle){
		return new Line(this.apply(operand.start), this.apply(operand.end));
	} else {
		var x = operand.x;
		var y = operand.y;
		return {x:this.a * x + this.c * y + this.e, y:this.d*y + this.b*x + this.f};
	}
}
Transformation.generateTransformation = function(start, end) {
	var vec = {
		x: (end.x - start.x), 
		y: (end.y - start.y)
	}; 
	var h = ((start.x - end.x) ** 2 + (start.y - end.y) ** 2) ** (0.5); //hypotenuse

	var theta_1 = Math.atan2(start.y, start.x);
	var theta_2 = Math.atan2(vec.y, vec.x);

	var dt = theta_2 - theta_1;

	var a = h*cos(dt)/unit; // scale * cos(angle) = (h/unit) * vec.y/h = (vec.y/unit)
	var b = h*sin(dt)/unit; 
	var c =	-h*sin(dt)/unit;
	var d = h*cos(dt)/unit;
	var e = start.x;
	var f = start.y;

	return new Transformation(a,b,c,d,e,f);
	
}

// Coordinate transformation from window to canvas.
function windowToCanvas(e){
	return {
		x: e.clientX - width/2,
		y: -e.clientY + (height/2 + 36)
	}
}

function filter(arr, fn){
	var result = [];
	for(var i = 0; i < arr.length; i++){
		if(fn(arr[i])){
			result.push(arr[i]);
		}
	}
	return result;
}

function initializeMenu(){
	// branch
	const branchButton = document.querySelector('#branch');
	const lineButton = document.querySelector('#shapes');

	branchButton.addEventListener('click', function(){
		branchButton.style.backgroundColor = 'rgb(229,230,231)';
		lineButton.style.backgroundColor = 'rgb(245,246,247)';

		meta.style = 'branch';
	})
	lineButton.addEventListener('click', function(){
		branchButton.style.backgroundColor = 'rgb(245,246,247)';
		lineButton.style.backgroundColor = 'rgb(229,230,231)';

		meta.style = "line";
	})
}
initializeMenu();

/* ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++ */
if(!ctx){throw '';}

function clear(){ctx.fillStyle = 'rgb(255,255,255)'; ctx.fillRect(-width/2, -height/2, width, height);}

ctx.fillStyle = 'rgb(0,0,0)';
ctx.setTransform(1, 0, 0, -1, Math.floor(width/2) + 0.5, Math.floor(height/2) + 0.5);

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

//Object renderer
objectRenderArray.push(fractal);
objectRenderArray.push(new Circle({x:-4,y:-4},{x:4, y:4}, 'rgb(255,127,39)'))

function render(){
	//clear
	clear();

	//draw
	objectRenderArray.forEach((obj) => obj.draw());

	//loop
	window.requestAnimationFrame(render);
}
render();



// Testing suite --------------------------------------------------------------------------------------------------------------------------------------- //
/*
function createPoint(a,b){
	return {x: a, y:b};
}
var start = {x:0, y:0};
var end = {x:100, y:100};

var branch = new Branch(start,end);
var line = new Line(start, end);
var circle = new Circle(start,end);

var p1 = createPoint(50, 0);
var p2 = createPoint(0, 50); 
var p3 = createPoint(50, 50);

console.log(branch.transformation.apply(p1));
*/
