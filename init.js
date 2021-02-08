/* ++++++++++++++++++++++++++++++++++++++++++++++++++++
 Object/Function definition page 
+++++++++++++++++++++++++++++++++++++++++++++++++++++++ */

var unit = 100; // 1 unit is defined as 100 pixels.
var operationLimit = 100000; //rough estimate on the number of operations that can be done in under 16 milliseconds.

var sin = Math.sin;
var cos = Math.cos;

var objectRenderArray = [];
var changeStack = [];

var meta = { // stores relevant information about the current drawstyle.
	maxDepth : 100,
	style : Line,
	thickness : 1
}

var fractal = {
	trunk: [],
	children: [],
	draw: function(){

		function helper(d, objArray){
			// filter objArray, discluding small objects
			objArray = filter(objArray, (obj) => obj.size() > 2);

			if( d === meta.maxDepth || objArray.length === 0){
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
		if(meta.style === Branch){
			fractal.children.push(new meta.style(start,end));
		} else {
			fractal.trunk.push(new meta.style(start,end));
		}
	},
	pushGhostObject : function(start){
		//Adds an object who's end point is determined dynamically by mouse position.

		if (meta.style === Branch){
			// adds three objects: A line, displaying the orientation, a circle, displaying the magnitude, and a child node.
			var displayCircle = new Circle(new Point(start.x - unit, start.y-unit), new Point(start.x+unit, start.y+unit), 'rgb(255,127,39)');
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
			var obj = new meta.style(start, new Point(start.x, start.y));
			fractal.updater = function(e){
				var end = windowToCanvas(e);
				obj.end = end;
			}
			window.addEventListener('mousemove', fractal.updater);
			fractal.trunk.push(obj);
		}
	},
	pop : function(){
		window.removeEventListener('mousemove', fractal.updater);
		if (meta.style === Branch){
			fractal.children.pop(); 
			objectRenderArray.pop(); 
			objectRenderArray.pop();
		} else {
			fractal.trunk.pop();
		}

	},
	updater : function(){}
}

/* 
Class definitions
*/

function Point(x,y){
	this.x = x;
	this.y = y;
	this.size = () => (this.x ** 2 + this.y ** 2) **(0.5);
}

function Line(start, end, color="rgb(0,0,0)"){
	this.start = start;
	this.end = end;
	this.size = () => Math.max(Math.abs(this.start.x - this.end.x), Math.abs(this.start.y - this.end.y));
	this.draw = function(){
		ctx.strokeStyle=color;
		ctx.beginPath();
		ctx.moveTo(this.start.x,this.start.y);
		ctx.lineTo(this.end.x,this.end.y);
		ctx.stroke();
	}
}

function Curve(start, end, color="rgb(0,0,0)"){}
function Oval(start, end, color="rgb(0,0,0)"){}
function Circle(start, end, color="rgb(0,0,0)"){
	this.start = start;
	this.end   = end;
	this.size = () => 0.5 * Math.min(Math.abs(this.end.x - this.start.x), Math.abs(this.end.y - this.start.y)) ;

	this.draw = function(){
		let center = new Point((this.start.x + this.end.x)/2,(this.start.y + this.end.y)/2);
		ctx.strokeStyle=color;
		ctx.beginPath();
		ctx.arc(center.x, center.y, this.size(), 0, 2* Math.PI);
		ctx.stroke();
	}
}

function Triangle(start, end, color="rgb(0,0,0)"){
	this.start = start;
	this.end = end;
	this.size = () => Math.max(Math.abs(this.start.x - this.end.x), Math.abs(this.start.y - this.end.y));
	this.draw = function(){
		ctx.strokeStyle = color;
		ctx.beginPath();
		ctx.moveTo(this.start.x, this.start.y);
		ctx.lineTo(this.end.x, this.start.y);
		ctx.lineTo((this.end.x + this.start.x)/2, this.end.y);
		ctx.lineTo(this.start.x, this.start.y);
		ctx.stroke();
	}
} 
function RightTriangle(start, end, color="rgb(0,0,0)"){}
function Rectangle(start, end, color="rgb(0,0,0)"){
	this.start = start;
	this.end = end;
	this.size = () => Math.max(Math.abs(this.start.x - this.end.x), Math.abs(this.start.y - this.end.y));
	this.draw = function () {
		ctx.strokeStyle = color;
		ctx.beginPath();
		ctx.moveTo(this.start.x, this.start.y);
		ctx.lineTo(this.end.x, this.start.y);
		ctx.lineTo(this.end.x, this.end.y);
		ctx.lineTo(this.start.x, this.end.y);
		ctx.lineTo(this.start.x, this.start.y);
		ctx.stroke();
	}
} 
function Pentagon(start, end, color="rgb(0,0,0)"){}
function Hexagon(start, end, color="rgb(0,0,0)"){
	this.start = start;
	this.end = end;
	this.size = () => Math.max(Math.abs(this.start.x - this.end.x), Math.abs(this.start.y - this.end.y));
	this.draw = function() {
		ctx.strokeStyle = color;
		ctx.beginPath();
		ctx.moveTo((this.start.x + this.end.x)/2, this.start.y);
		ctx.lineTo(this.end.x, this.start.y + 0.25*(this.end.y - this.start.y));
		ctx.lineTo(this.end.x, this.start.y + 0.75*(this.end.y - this.start.y));
		ctx.lineTo((this.start.x + this.end.x)/2, this.end.y);
		ctx.lineTo(this.start.x, this.start.y + 0.75* (this.end.y - this.start.y));
		ctx.lineTo(this.start.x, this.start.y + 0.25 * (this.end.y - this.start.y));
		ctx.lineTo((this.start.x + this.end.x)/2, this.start.y);
		ctx.stroke();
	}
}

function Septagon(start, end, color="rgb(0,0,0)"){}

function Octagon(start, end, color="rgb(0,0,0)"){
	this.start = start;
	this.end = end;
	this.size = () => Math.max(Math.abs(this.start.x - this.end.x), Math.abs(this.start.y - this.end.y));
	this.draw = function() {
		var c = 1/(2+2**(0.5));
		var adx = c*(this.end.x - this.start.x);
		var ady = c*(this.end.y - this.start.y);

		ctx.strokeStyle = color;
		ctx.beginPath();
		ctx.moveTo(this.start.x + adx, this.start.y);
		ctx.lineTo(this.end.x - adx, this.start.y);
		ctx.lineTo(this.end.x, this.start.y + ady);
		ctx.lineTo(this.end.x, this.end.y - ady);
		ctx.lineTo(this.end.x - adx, this.end.y);
		ctx.lineTo(this.start.x + adx, this.end.y);
		ctx.lineTo(this.start.x, this.end.y - ady);
		ctx.lineTo(this.start.x, this.start.y + ady);
		ctx.lineTo(this.start.x + adx, this.start.y);
		ctx.stroke();
	}
}

function RoundedRectangle(start, end, color="rgb(0,0,0)"){} //*
function Polygon(start, end, color="rgb(0,0,0)"){}
function RightArrow(start, end, color="rgb(0,0,0)"){}
function LeftArrow(start, end, color="rgb(0,0,0)"){}
function UpArrow(start, end, color="rgb(0,0,0)"){}
function DownArrow(start, end, color="rgb(0,0,0)"){}

function FourStar(start, end, color="rgb(0,0,0)"){
	this.start = start;
	this.end = end;
	this.size = () => Math.max(Math.abs(this.start.x - this.end.x), Math.abs(this.start.y - this.end.y));
	this.draw = function() {
		ctx.strokeStyle = color;
		var mx = (this.start.x + this.end.x)/2;
		var my = (this.start.y + this.end.y)/2;

		var dx = mx / 4;
		var dy = my / 4;

		ctx.moveTo(mx, this.start.y);
		ctx.lineTo(mx + dx, my - dy);
		ctx.lineTo(this.end.x, my);
		ctx.lineTo(mx + dx, my + dy);
		ctx.lineTo(mx, this.end.y);
		ctx.lineTo(mx-dx, my + dy);
		ctx.lineTo(this.start.x, my);
		ctx.lineTo(mx - dx, my - dy);
		ctx.lineTo(mx, this.start.y);
		ctx.stroke();
	}
}
function FiveStar(start, end, color="rgb(0,0,0)"){
	this.start = start; 
	this.end = end;
	this.size = () => Math.max(Math.abs(this.start.x - this.end.x), Math.abs(this.start.y - this.end.y));
	this.draw = function(){
		var dx = this.end.x - this.start.x;
		var dy = this.end.y - this.start.y;

		var x0 = this.start.x;
		var y0 = this.start.y;
		var x1 = this.end.x;
		var y1 = this.end.y;

		ctx.strokeStyle = color;
		ctx.beginPath();
		ctx.moveTo(x0 + 0.194*dx, y0);
		ctx.lineTo(x0 + 0.502*dx, y0 + 0.218*dy);
		ctx.lineTo(x0 + 0.812*dx, y0);
		ctx.lineTo(x0 + 0.704*dx, y0 + 0.378*dy);
		ctx.lineTo(this.end.x, y0 + 0.608*dy);
		ctx.lineTo(x0 + 0.622*dx, y0 + 0.618*dy);
		ctx.lineTo(x0 + 0.5*dx, this.end.y);
		ctx.lineTo(x0 + 0.38*dx, y0 + 0.62*dy);
		ctx.lineTo(x0, y0 + 0.604*dy);
		ctx.lineTo(x0 + 0.302*dx, y0 + 0.378*dy);
		ctx.lineTo(x0 + 0.194*dx, y0);
		ctx.stroke();
	}
}

function SixPointStar(start, end, color="rgb(0,0,0)"){}

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
	}else if(operand instanceof Point){
		var x = operand.x;
		var y = operand.y;
		return new Point(this.a * x + this.c * y + this.e, this.d*y + this.b*x + this.f);
	} else {
		return new operand.constructor(this.apply(operand.start), this.apply(operand.end));
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
	return new Point(e.clientX - width/2, -e.clientY + (height/2 + 36))
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
	var shapesMap = {
		"line":Line, 
		"circle":Circle,
		"triangle":Triangle, 
		"rectangle":Rectangle, 
		"hexagon":Hexagon, 
		"octagon":Octagon, 
		"fourstar":FourStar, 
		"fivestar": FiveStar,
		"branch":Branch
	};

	var last;

	let menu = document.querySelector('#menu');

	//create event handler
	function handler(e){
		// find target of hit
		let target = e.target;
		if (target.getAttribute('class') !== 'menuImage'){
			return;
		}

		target = target.parentNode;
		meta.style = shapesMap[target.id];
		target.setAttribute('class', 'menuItem menuItem_Selected');

		if(last !== undefined){
			last.setAttribute('class', 'menuItem');
		}

		if (last === target){
			last = undefined;
		} else {
			last = target;
		}
	}

	//attatch handler to shapes menu.
	menu.addEventListener('click', handler);


}

// Testing: 

let p1 = new Point(0, 0);
let p2 = new Point(100, 100);

let line = new Line(p1,p2);
let circle = new Circle(p1,p2);
let triangle = new Triangle(p1,p2);
let rectangle = new Rectangle(p1,p2);
let hexagon = new Hexagon(p1,p2);
let octagon = new Octagon(p1,p2);
let fourps = new FourStar(p1,p2);
let fiveps = new FiveStar(p1,p2);

let trans = Transformation.generateTransformation(p1,p2);
