/* ++++++++++++++++++++++++++++++++++++++++++++++++++++
 Object/Function definition page 
+++++++++++++++++++++++++++++++++++++++++++++++++++++++ */

var unit = 100; // 1 unit is defined as 100 pixels.
var operationLimit = 100000; //rough estimate on the number of operations that can be done in under 16 milliseconds.

var sin = Math.sin;
var cos = Math.cos;

var objectRenderArray = [];

var meta = { // stores relevant information about the current drawstyle.
	maxDepth : 100,
	style : Line,
	thickness : 1,
	color: black
}

var actions = { // holds a history of the objects added to fractal.
	undoList : [],
	unundoList : []
}

var fractal = {
	trunk: [],
	children: [],
	draw: function(){

		function helper(d, objArray){
			// filter objArray, discluding small objects
			objArray = filter(objArray, (obj) => obj.size > 2);

			if( d === meta.maxDepth || objArray.length === 0){
				return;
			}

			// draw the elements of obj array, fill temp
			for(var i = 0; i < objArray.length; i++){
				objArray[i].draw();
			}

			// iterate over transformation array
			for (var j = 0; j<fractal.children.length; j++){
			//	for each, apply the transformation to a copy of objArray and recursively call helper.
				let trans = fractal.children[j].transformation;
				helper(d + 1, map(objArray, (el) => trans.apply(el)));
			}
		}
		helper(0, fractal.trunk);
	},
	pushNewObject : function(start, end){
		if(meta.style === Branch){
			fractal.children.push(new Branch(Transformation.generateTransformation1(start, end, unit, meta.color)));
			actions.undoList.push(() => fractal.children.pop());
		} else {
			let trans = Transformation.generateTransformation3(start, end);
			fractal.trunk.push(new meta.style(trans, meta.color, meta.thickness));
			actions.undoList.push(() => fractal.trunk.pop());
		}

		actions.unundoList = [];
	},
	pushGhostObject : function(start){
		//Adds an object who's end point is determined dynamically by mouse position.
		// 'start' is assumed to be a point object.

		if (meta.style === Branch){
			// adds three objects: A line, displaying the orientation, a circle, displaying the magnitude, and a child node.

			var displayCircle = new Circle(new Transformation(unit, 0, 0, unit, start.x, start.y), new Color(255,127,39));
			var displayLine = new Line(zero, new Color(255,127,39));
			var branch = new Branch(zero);

			fractal.updater = function(e){
				var end = windowToCanvas(e);

				var transRel = Transformation.generateTransformation1(start, end, unit, meta.color);
				var transAbs = Transformation.generateTransformation3(start, end);

 				branch.transformation = transRel;
				displayLine.points = map(displayLine.template, (el) => transAbs.apply(el));
			}
			window.addEventListener('mousemove', fractal.updater);

			fractal.children.push(branch);
			objectRenderArray.push(displayLine);
			objectRenderArray.push(displayCircle);

		} else {
			var obj = new meta.style(Transformation.generateTransformation3(start, new Point(start.x, start.y)), meta.color, meta.thickness);
			fractal.updater = function(e){
				var end = windowToCanvas(e);
				var trans = Transformation.generateTransformation3(start, end);
				obj.points = map(obj.template, (el) => trans.apply(el));
				obj.size = trans.size;
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
function Color(r,g,b){
	this.r = r;
	this.b = b;
	this.g = g;
}
Color.prototype.toString = function(){
	return `rgb(${this.r},${this.g},${this.b})`;
}

var black = new Color(0,0,0);

function Branch(transformation){
	this.transformation = transformation;
}

function Point(x,y){
	this.x = x;
	this.y = y;
	this.size = (this.x ** 2 + this.y ** 2) ** (0.5);
}

function Shape(points = [], size=undefined, color = black, thickness = 1){
	this.points = points;
	this.color = color;
	this.thickness = thickness;
	if(size === undefined){
		this.size = radius(points);
	} else {
		this.size = size;
	}

	this.draw = function(){
		let last = this.points.length - 1;
		ctx.lineWidth = this.thickness;
		ctx.strokeStyle = this.color.toString();
		ctx.beginPath();
		ctx.moveTo(this.points[last].x, this.points[last].y);
		this.points.forEach((el) => ctx.lineTo(el.x, el.y));
		ctx.stroke();
	}
}
function Line(transformation, color=black, thickness = 1){
	this.template = [new Point(0,0), new Point(0,1)];
	Shape.call(this, map(this.template, (el) => transformation.apply(el)), transformation.size, color, thickness);

	this.draw = function(){ // unique draw function for performance reasons.
		ctx.strokeStyle = this.color.toString();
		ctx.lineWidth = this.thickness;
		ctx.beginPath();
		ctx.moveTo(this.points[0].x, this.points[0].y);
		ctx.lineTo(this.points[1].x, this.points[1].y);
		ctx.stroke();
	}
}
function Triangle(transformation, color = black, thickness = 1){
	this.template = [new Point(-0.5, 0), new Point(0.5, 0), new Point(0,1)];
	Shape.call(this, map(this.template, (el) => transformation.apply(el)), transformation.size, color, thickness);
}
function Curve(transformation, color=black, thickness = 1){}
function Oval(transformation, color=black, thickness = 1){}
function Circle(transformation, color=black, thickness = 1){
	this.template = [new Point(0,0)];
	Shape.call(this, map(this.template, (el) => transformation.apply(el)), transformation.size, color, thickness);
	this.draw = function(){ //special draw function.
		ctx.lineWidth = this.thickness;
		ctx.strokeStyle=this.color.toString();
		ctx.beginPath();
		ctx.arc(this.points[0].x, this.points[0].y, this.size, 0, 2*Math.PI);
		ctx.stroke();
	}
}
function RightTriangle(transformation, color=black, thickness = 1){}
function Rectangle(transformation, color=black, thickness = 1){
	this.template = [new Point(-0.5,0), new Point(0.5,0), new Point(0.5,1), new Point(-0.5,1)]
	Shape.call(this, map(this.template, (el) => transformation.apply(el)), transformation.size, color, thickness);
} 
function Pentagon(transformation, color=black, thickness = 1){}
function Hexagon(transformation, color=black, thickness = 1){
	// x = 0.2257
	// 1-x = 0.7743
	this.template = [new Point(0,0), new Point(0.5, 0.2257), new Point(0.5, 0.7743), new Point(0,1), new Point(-0.5,0.7743), new Point(-0.5,0.2257)];
	Shape.call(this, map(this.template, (el) => transformation.apply(el)), transformation.size, color, thickness);
}
function Septagon(transformation, color=black, thickness = 1){}
function Octagon(transformation, color=black, thickness = 1){
	//x = 0.292893
	// x-0.5 = -0.2071
	// 0.5 -x = 0.2071
	// 1-x = 0.7071
	this.template = [new Point(-0.2071,0), new Point(0.2071,0), new Point(0.5, 0.292893), new Point(0.5, 0.7071), new Point(0.2071,1), new Point(-0.2071,1), new Point(-0.5, 0.7071), new Point(-0.5, 0.292893)];
	Shape.call(this, map(this.template, (el) => transformation.apply(el)), transformation.size, color, thickness);	
}
function RoundedRectangle(transformation, color=black, thickness = 1){} //*
function Polygon(transformation, color=black, thickness = 1){}
function RightArrow(transformation, color=black, thickness = 1){}
function LeftArrow(transformation, color=black, thickness = 1){}
function UpArrow(transformation, color=black, thickness = 1){}
function DownArrow(transformation, color=black, thickness = 1){}
function FourStar(transformation, color=black, thickness = 1){
	this.template = [new Point(0,0), new Point(0.125, 0.375), new Point(0.5, 0.5), new Point(0.125, 0.625), new Point(0,1), new Point(-0.125,0.625), new Point(-0.5,0.5), new Point(-0.125, 0.375)];
	Shape.call(this, map(this.template, (el) => transformation.apply(el)), transformation.size, color, thickness);		
}
function FiveStar(transformation, color=black, thickness = 1){
	this.template = [new Point(-0.306, 0), new Point(0.002, 0.218), new Point(0.312, 0), new Point(0.204, 0.378), new Point(0.5, 0.608), new Point(0.122, 0.618), new Point(0, 1), new Point(-0.12, 0.627), new Point(-0.5, 0.604), new Point(-0.198, 0.378)];
	Shape.call(this, map(this.template, (el) => transformation.apply(el)), transformation.size, color, thickness);		
}
function SixPointStar(transformation, color=black, thickness = 1){}

function Transformation(a,b,c,d,e,f,color=black){
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

	this.xscale = (a**2 + b**2)**(0.5);
	this.yscale = (c**2 + d**2)**(0.5);

	this.size = Math.max(this.xscale, this.yscale);

	//color attributes
	this.r = color.r;
	this.g = color.g;
	this.bl = color.b;
}
Transformation.prototype.apply = function(operand){
	// Transformation application function. Accepts points, shapes, and other transformations.
	// Input MUST be point, shape, or transformation.
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

		return new Transformation(a,b,c,d,e,f, this.r, this.g, this.bl);
	}else if(operand instanceof Point){
		var x = operand.x;
		var y = operand.y;
		return new Point(Math.floor(this.a * x + this.c * y + this.e), Math.floor(this.d*y + this.b*x + this.f));
	} else {
		let r = Math.round(operand.color.r + (this.r - operand.color.r)/5);
		let g = Math.round(operand.color.g + (this.g - operand.color.g)/5);
		let b = Math.floor(operand.color.b + (this.bl - operand.color.b)/5);
		return new Shape(map(operand.points, (el) => this.apply(el)), operand.size * this.size, new Color(r,g,b), operand.thickness);
	}
}

Transformation.generateTransformation1 = function(start, end, scale=1, color=black) {
	//relative rotation
	var vec = {
		x: (end.x - start.x), 
		y: (end.y - start.y)
	}; 
	var h = ((vec.x) ** 2 + (vec.y) ** 2) ** (0.5); //hypotenuse

	var theta_1 = Math.atan2(start.y, start.x)
	var theta_2 = Math.atan2(vec.y, vec.x);

	var dt = theta_2 - theta_1;
	let adj = cos(dt);
	let opp = sin(dt);

	var a = h*adj/scale;
	var b = h*opp/scale; 
	var c =	-h*opp/scale;
	var d = h*adj/scale;
	var e = start.x;
	var f = start.y;

	return new Transformation(a,b,c,d,e,f, color);
	
}

Transformation.generateTransformation2 = function(angle, size, dx, dy, color=black){
	// simple method to generate a transformation.
	let opp = sin(angle) * size;
	let adj = cos(angle) * size;

	return new Transformation(adj, opp, -opp, adj, dx, dy, color);
}

Transformation.generateTransformation3 = function(start, end, color=black){
	//absolute rotation.
	let dx = (end.x - start.x)/scale;
	let dy = (end.y - start.y)/scale;

	var a = dy;
	var b = -dx;
	var c = dx;
	var d = dy;
	var e = start.x;
	var f = start.y;

	return new Transformation(a,b,c,d,e,f, color);
}

let id = new Transformation(1,0,0,1,0,0); // identity transformation
let zero = new Transformation(0,0,0,0,0,0);

// Auxilliary helper functions.
function filter(arr, fn){
	var result = [];
	for(var i = 0; i < arr.length; i++){
		if(fn(arr[i])){
			result.push(arr[i]);
		}
	}
	return result;
}

function map(arr, fn){
	var result = [];
	for(var i = 0; i < arr.length; i++){
		result.push(fn(arr[i]));
	}
	return result;
}

function radius(arr){
	m = 0;
	let distance = (p1, p2) => Math.max(Math.abs(p1.x - p2.x), Math.abs(p1.y - p2.y));

	for(var i = 0; i < arr.length; i++){
		for(var j = i; j < arr.length; j++){
			m = Math.max(m, distance(arr[i], arr[j]));
		}
	}
	return m;
}

// Container function for initializing interactive buttons in the web page.
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

let trans1 = new Transformation(200,0,0,200,0,0);
let trans2 = new Transformation(0,100,-100,0,0,0);
let trans3 = new Transformation(100,0,0,100,10,10);

let trans4 = new Transformation(100,100,100,100, 100, 100);
let trans5 = new Transformation(1,12,20,10,10,100);
let trans6 = new Transformation(-10, -10, 100, 20, -100,-100);

let l1 = new Line(trans1, black, 1);
let l2 = new Line(trans2);
let l3 = new Line(trans3);

let l4 = new Line(trans4);
let l5 = new Line(trans5);
let l6 = new Line(trans6);

let color = new Color(255,0,0);
let colorTrans = new Transformation(100,0,0,100,0,0,color);
let ex = colorTrans.apply(l1);
function deepEquals(actual, expected){

	function helper(actual, expected){
		if (typeof actual != typeof expected){
			return false;
		}

		if(typeof actual === 'object'){
			let t = true;
			for(var x in actual){
				t = t && helper(actual[x], expected[x]);
			}
			for(var x in expected){
				t = t && helper(actual[x], expected[x]);
			}

			if(t === false){
			}
			return t;

		} else if (typeof actual === 'number'){ // must use fuzzy equals for float case.
			return Math.abs(actual - expected) < 0.00001;
		} else {
			return (actual === expected);
		}
	}

	let t = helper(actual, expected);
	return t;
}

function assertEquals(actual, expected, message){
	if(deepEquals(actual,expected)){
		console.log(`Test successful.`);
		return;
	}
	console.log(`Test[${message}] failed.`)
}

function transformationUnitTest(){
	let p1 = new Point(0,0);
	let p2 = new Point(1,0);
	let p3 = new Point(0,1);
	let p4 = new Point(1,1);

	console.log("Beginning transformation test:");
	console.log("Beginning primitive transformation tests:");
	// id test.
	console.log('Testing transformation(id):');
	let trans1 = id;
	let msg1 = 'Trivial identity test.'
	assertEquals(trans1.apply(p1),p1,msg1);
	assertEquals(trans1.apply(p2),p2,msg1);
	assertEquals(trans1.apply(p3),p3,msg1);
	assertEquals(trans1.apply(p4),p4,msg1);
	console.log('\n');

	//scale test
	console.log('Testing transformation(double):');
	let trans2 = new Transformation(2,0,0,2,0,0);
	let msg2 = "Doubling length.";
	assertEquals(trans2.apply(p1),new Point(0,0),msg2);
	assertEquals(trans2.apply(p2),new Point(2,0),msg2);
	assertEquals(trans2.apply(p3),new Point(0,2),msg2);
	assertEquals(trans2.apply(p4),new Point(2,2),msg2);
	console.log('\n');

	//rotate test
	console.log('Testing transformation(rot-pi/2):');
	let trans3 = new Transformation(0,1,-1,0,0,0);
	let msg3 = "Rotate Pi/2 radians counter-clockwise.";
	assertEquals(trans3.apply(p1),new Point(0,0),msg3);
	assertEquals(trans3.apply(p2),new Point(0,1),msg3);
	assertEquals(trans3.apply(p3),new Point(-1,0),msg3);
	assertEquals(trans3.apply(p4),new Point(-1,1),msg3);
	console.log('\n');

	//Translate test.
	console.log('Testing transformation(trans-1,1):');
	let trans4 = new Transformation(1,0,0,1,1,1);
	let msg4 = "Translate 1 up 1 right.";
	assertEquals(trans4.apply(p1),new Point(1,1),msg4);
	assertEquals(trans4.apply(p2),new Point(2,1),msg4);
	assertEquals(trans4.apply(p3),new Point(1,2),msg4);
	assertEquals(trans4.apply(p4),new Point(2,2),msg4);
	console.log('\n');

	console.log('\n\n');
	//Transformation apply to transformation testing
	console.log("Beginning test for transformation-transformation operations.");

	assertEquals(zero.apply(new Transformation(1,1,1,1,1,1)), zero, "Zero matrix times anything is zero.");
	assertEquals(id.apply(new Transformation(1,1,1,1,1,1)), new Transformation(1,1,1,1,1,1), "Identity times x is x.");
	assertEquals((new Transformation(1,1,1,1,1,1)).apply(id), new Transformation(1,1,1,1,1,1), "x times identity is x.")
	assertEquals(trans2.apply(trans4), new Transformation(2,0,0,2,2,2), "Trans, then double.");
	assertEquals(trans4.apply(trans2), new Transformation(2,0,0,2,1,1), "Double, then trans.");
	assertEquals(trans3.apply(trans2), new Transformation(0,2,-2,0,0,0), "Rotate, double.");

	console.log('\n\n\n')
	//Transformation generation testing.
	console.log("Beginning test for transformation generation functions.");
	console.log("Two-point generation, relative:");
	assertEquals(Transformation.generateTransformation1(new Point(0,0), new Point(1,0)), new Transformation(1,0,0,1,0,0), "Identity.");
	assertEquals(Transformation.generateTransformation1(new Point(0,0), new Point(-1,0)), new Transformation(-1,0,0,-1,0,0), "Rotate (pi)");
	assertEquals(Transformation.generateTransformation1(new Point(0,0), new Point(0,-1)), new Transformation(0,-1,1,0,0,0), "Rotate (3pi/2)");
	assertEquals(Transformation.generateTransformation1(new Point(1,0), new Point(1,1)), new Transformation(0,1,-1,0,1,0), "Rotate(pi/2), trans:1,0");
	assertEquals(Transformation.generateTransformation1(new Point(1,0), new Point(2,0)), new Transformation(1,0,0,1,1,0), 'trans:1,0');
	assertEquals(Transformation.generateTransformation1(new Point(0,-1), new Point(0,0)), new Transformation(-1,0,0,-1,0,-1), 'Rot(pi), Trans:0,-1');
	console.log("Size-angle-trans generation:");
	assertEquals(Transformation.generateTransformation2(0, 1, 0, 0), id, "Identity.");
	assertEquals(Transformation.generateTransformation2(0,2,0,0), new Transformation(2,0,0,2,0,0), "Double.");
	assertEquals(Transformation.generateTransformation2(Math.PI/2, 1, 0,0), new Transformation(0, 1, -1, 0,0,0), "Rotate(pi/2)");
	assertEquals(Transformation.generateTransformation2(0,1,1,1), new Transformation(1,0,0,1,1,1), "Trans:1,1");
	console.log("Two-point generation, absolute.");
	assertEquals(Transformation.generateTransformation3(new Point(0,0), new Point(0,1)), new Transformation(1,0,0,1,0,0), "Identity.");
	assertEquals(Transformation.generateTransformation3(new Point(0,0), new Point(-1,0)), new Transformation(0,1,-1,0,0,0), "Rotate (pi/2)");
	assertEquals(Transformation.generateTransformation3(new Point(0,0), new Point(0,-1)), new Transformation(-1,0,0,-1,0,0), "Rotate (pi)");
	assertEquals(Transformation.generateTransformation3(new Point(1,0), new Point(1,1)), new Transformation(1,0,0,1,1,0), "Trans: 1,0");
	assertEquals(Transformation.generateTransformation3(new Point(1,0), new Point(2,0)), new Transformation(0,-1,1,0,1,0), 'Rot:-pi/2, trans:1,0');
	assertEquals(Transformation.generateTransformation3(new Point(0,-1), new Point(0,0)), new Transformation(1,0,0,1,0,-1), 'Trans:0,-1');

	//Color Transformation testing
}

