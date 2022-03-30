function initializeMenu(){var e={line:Line,circle:Circle,triangle:Triangle,rectangle:Rectangle,hexagon:Hexagon,octagon:Octagon,fourstar:FourStar,fivestar:FiveStar,branch:Branch,grab:"grab"},t={one:1,two:2,three:3,four:4,five:5,six:6,seven:7,eight:8,nine:9,ten:10},o={target:document.querySelector("#branch"),class:"branchContainer"},r=!1;let n=document.querySelector("#menu"),a=document.querySelector("#thicknessInputMenu");function i(n){let a=n.target;r&&(document.querySelector("#thicknessInputMenu").style.display="none",document.querySelector("#thicknessDisplay").setAttribute("class","thicknessContainer"),r=!1);let i=a.getAttribute("class");if("menuImage"===i){if(a=a.parentNode,"undo"===a.id)return void actionObject.ctrl.z();if("redo"===a.id)return void actionObject.ctrl.y();if("center"===a.id)return void resetCoordinates();if("thicknessDisplay"===a.id){return document.querySelector("#thicknessDisplay").setAttribute("class","thicknessContainer selected"),document.querySelector("#thicknessInputMenu").style.display="block",void(r=!0)}if("thicknessOption"===a.getAttribute("class"))return void(meta.thickness=t[a.id]);if("stroke"===a.id)meta.fillStyle="stroke",document.querySelector("#stroke").setAttribute("class","menuItem selected"),document.querySelector("#fill").setAttribute("class","menuItem");else if("fill"===a.id)meta.fillStyle="fill",document.querySelector("#stroke").setAttribute("class","menuItem"),document.querySelector("#fill").setAttribute("class","menuItem selected");else if("save"===a.id)save();else if("new"===a.id){confirm("Do you want to save changes to this image?")&&save(),setTimeout((()=>window.location.replace(window.location.href)),1e3)}else{meta.style=e[a.id];let t=a.getAttribute("class");a.setAttribute("class",t+" selected"),void 0===o.target?(o.target=a,o.class=t):(o.target.setAttribute("class",o.class),o.target===a?(o.target=void 0,o.class=void 0,meta.style=Line):(o.target=a,o.class=t))}}else{if("colorBoxInterior"!==i)return;{let e=a.parentNode;if("backgroundColor"===e.id)meta.colorStyle="backgroundColor",document.querySelector("#drawColorContainer").setAttribute("class","colorStyle"),document.querySelector("#backgroundColorContainer").setAttribute("class","colorStyle selected");else if("drawColor"===e.id)meta.colorStyle="drawColor",document.querySelector("#backgroundColorContainer").setAttribute("class","colorStyle"),document.querySelector("#drawColorContainer").setAttribute("class","colorStyle selected");else{let t=e.id;document.querySelector(`#${meta.colorStyle} .colorBoxInterior`).style.backgroundColor=t,"backgroundColor"===meta.colorStyle?(meta.backgroundColor=colorMap[t],document.querySelector("main").style.backgroundColor=t):"drawColor"===meta.colorStyle&&(meta.drawColor=colorMap[t])}}}}n.addEventListener("click",i),a.addEventListener("click",i),document.querySelector("#customColor").addEventListener("input",(function(e){let t=e.target.value;"backgroundColor"===meta.colorStyle?(meta.backgroundColor=new Color(t.slice(1,3),t.slice(3,5),t.slice(5,7),hex=!0),document.querySelector("main").style.backgroundColor=t):"drawColor"===meta.colorStyle&&(meta.drawColor=new Color(t.slice(1,3),t.slice(3,5),t.slice(5,7),hex=!0)),document.querySelector(`#${meta.colorStyle} .colorBoxInterior`).style.backgroundColor=t})),document.querySelector("#fading").addEventListener("input",(function(e){meta.fadeVal=e.target.value/100}));const c=document.querySelector("canvas");c.addEventListener("mouseenter",(function(){"grab"===meta.style?document.querySelector("main").style.cursor="grabbing":document.querySelector("main").style.cursor="crosshair"})),c.addEventListener("mouseleave",(function(){document.querySelector("main").style.cursor="auto"}))}const canvas=document.querySelector("canvas"),ctx=canvas.getContext("2d");if(!ctx)throw"";var width=canvas.width=window.innerWidth,height=canvas.height=window.innerHeight-36;function resetCoordinates(){width=canvas.width=window.innerWidth,height=canvas.height=window.innerHeight-36,ctx.setTransform(1,0,0,-1,width/2,height/2),boundaries.updateBoundaries();for(let e=0;e<fractal.contexts.length;e++)c=fractal.contexts[e],can=c.canvas,can.width=width,can.height=height,c.setTransform(1,0,0,-1,width/2,height/2),clear(c);fractal.resetState()}ctx.setTransform(1,0,0,-1,Math.floor(width/2),Math.floor(height/2)),window.addEventListener("resize",resetCoordinates);let x=0,y=0,mousedown=!1,mouse={x:0,y:0},renderInterrupt=!1,boundaries={top:height/2,right:width/2,bottom:-height/2,left:-width/2,updateBoundaries:function(){boundaries.top=height/2,boundaries.right=width-width/2,boundaries.bottom=-(height-height/2),boundaries.left=-width/2}};function pushFractal(e,t,o,r,n,a,i){fractal.push(e,t,o,r,n,a,i),actions.undoList.push((function c(){return fractal.pop(o),function(){return fractal.push(e,t,o,r,n,a,i),c}})),actions.unundoList=[]}function mouseupHandler(e){if(!1===mousedown)return;fractal.pop(meta.style),pushFractal(new Point(x,y),new Point(mouse.x,mouse.y),meta.style,meta.drawColor,meta.thickness,meta.fillStyle,meta.fadeVal),mousedown=!1,meta.style==Branch&&(objectRenderArray.pop(),objectRenderArray.pop())}function mousedownHandler(e){if(0===e.button){recentlySaved=!1;let t=windowToCanvas(e);if(x=t.x,y=t.y,mousedown=!0,fractal.push(t,t,meta.style,meta.drawColor,meta.thickness,meta.fillStyle,meta.fadeVal),meta.style==Branch){let t=windowToCanvas(e),o=new Circle(new Transformation(2*meta.unit*meta.maxScale,0,0,2*meta.unit*meta.maxScale,t.x,t.y-196),colorMap.orange,1);objectRenderArray.push(o),objectRenderArray.push(new Line(Transformation.generateTransformation3(t,t)))}}}function updateMouseCoords(e){let t=windowToCanvas(e);mouse.x=t.x,mouse.y=t.y}function windowToCanvas(e){return new Point(e.clientX-Math.floor(width/2),-(e.clientY-Math.floor(height/2)))}function keydownHandler(e){e.ctrlKey?void 0!==actionObject.ctrl[e.key]&&actionObject.ctrl[e.key]():void 0!==actionObject.noctrl[e.key]&&actionObject.noctrl[e.key]()}function render(e){if(!renderInterrupt){if(mousedown){fractal.pop(meta.style);let e=new Point(x,y),t=new Point(mouse.x,mouse.y);fractal.push(e,t,meta.style,meta.drawColor,meta.thickness,meta.fillStyle,meta.fadeVal),meta.style==Branch&&(objectRenderArray.pop(),objectRenderArray.push(new Line(Transformation.generateTransformation3(e,t,meta.unit,colorMap.black,0,meta.unit*meta.maxScale),colorMap.orange)))}clear(ctx),objectRenderArray.forEach((e=>e.draw(ctx)))}window.requestAnimationFrame(render)}canvas.addEventListener("mousedown",mousedownHandler),window.addEventListener("mouseup",mouseupHandler),window.addEventListener("mousemove",updateMouseCoords),window.addEventListener("keydown",keydownHandler),pushFractal(new Point(0,0),new Point(0,100),Line,meta.drawColor,2,meta.fillStyle,meta.fadeVal),meta.style=Branch,meta.drawColor=colorMap.green,objectRenderArray.push(fractal),objectRenderArray.push(new Circle(new Transformation(10,0,0,10,0,-5),"rgb(255,127,39)")),initializeMenu(),startRender&&render(),test&&console.log(`Total time: ${fractalDrawBenchmark()}`);
//# sourceMappingURL=index.4e6858d8.js.map
