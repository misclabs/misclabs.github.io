window.addEventListener("load", function initializePage(evt) {
	"use strict"
	try {
		// Only run once.
		window.removeEventListener(evt.type, initializePage, false);

		const backgroundRgb = [26.0/256, 26.0/256, 26.0/256];

		mnbRndrMrkdwnByCls();

		// DOM Elements
		const msgEl = document.querySelector("#msg");
		const demo1Canvas = document.querySelector("#demo1");
		
		// Shader sources
		const screenSpaceVertexShaderSrc = `
attribute vec2 screenPosition;
uniform vec2 screenSize;
void main() {
	// screenPosition => [0.0, 1.0]
	vec2 zeroToOne = screenPosition / screenSize;

	// [0.0, 1.0] => [0.0, 2.0]
	vec2 zeroToTwo = zeroToOne * 2.0;

	// [0.0, 2.0] => [-1.0, 1.0]
	vec2 clipPosition = zeroToTwo - 1.0;

	gl_Position = vec4(clipPosition * vec2(1, -1), 0, 1);
}`;
		function setupScreenSpaceVertexShader(gc, program) {
			const screenSizeUniformLoc = gc.getUniformLocation(program, "screenSize");
			
			const screenPositionAttrLoc = gc.getAttribLocation(program, "screenPosition");
			const screenPositionBuffer = gc.createBuffer();

			let screenPositionLength = 0;

			function loadPositionData(screenPositions) {
				// screenPositions needs to be Float32Array
				screenPositionLength = screenPositions.length;
				gc.bindBuffer(gc.ARRAY_BUFFER, screenPositionBuffer);
				gc.bufferData(gc.ARRAY_BUFFER, screenPositions, gc.STATIC_DRAW);		
			};
			return {
				loadPositionData,
				loadRectData: (x, y, width, height) => {
					const x2=x+width, y2=y+height;
					loadPositionData(new Float32Array([
						x, y,
						x2, y,
						x2, y2,
						x, y2,
						x, y,
						x2, y2,
					]));
				},
				setScreenSize: (width, height) => {
					gc.uniform2f(screenSizeUniformLoc, width, height);
				},
				drawTriangles: () => {
					gc.enableVertexAttribArray(screenPositionAttrLoc);
					gc.bindBuffer(gc.ARRAY_BUFFER, screenPositionBuffer);
					
					let size=2, type=gc.FLOAT, normalize=false, stride=0, ptrOffset = 0;
					gc.vertexAttribPointer(screenPositionAttrLoc, size, type, normalize, stride, ptrOffset);

					let primitiveType=gc.TRIANGLES, drawOffset=0;
					gc.drawArrays(primitiveType, drawOffset, screenPositionLength/size);	
				},
			};
		}
		
		const uniformColorFragSrc = `
precision mediump float;
uniform vec4 color;
void main() {
	gl_FragColor = color;
}`;
		const clipSpaceVertexShaderSrc = document.querySelector("#clipSpaceVertexShader").text;
		const constFragmentShaderSrc = document.querySelector("#constFragmentShader").text;

		initDemo1(document.querySelector("#demo1"));
		initDemo2(document.querySelector("#demo2"));
		initUniformColorDemo(document.querySelector("#uniformColorDemo"));

		function initDemo1(canvas) {
			let gc = initGraphicsContext(canvas);
			let program = createProgram(gc, clipSpaceVertexShaderSrc, constFragmentShaderSrc);
	
			let clipPositionAttrLoc = gc.getAttribLocation(program, "clipPosition");
			let clipPositionBuffer = gc.createBuffer();
			gc.bindBuffer(gc.ARRAY_BUFFER, clipPositionBuffer);
			// Pairs of 2D coordinates
			var clipPositions = [
				0, 0,
				0, 0.5,
				0.7, 0,
			];
			gc.bufferData(gc.ARRAY_BUFFER, new Float32Array(clipPositions), gc.STATIC_DRAW);
	
			const tickDurSec = 1.0/60.0;
			setInterval(tick, tickDurSec * 1000 );
	
			function tick() {
				resizeCanvasToDisplaySize(gc.canvas);
				gc.viewport(0, 0, gc.canvas.width, gc.canvas.height);
		
				gc.clearColor(0, 0, 0, 0);
				gc.clear(gc.COLOR_BUFFER_BIT);
		
				gc.useProgram(program);
				gc.enableVertexAttribArray(clipPositionAttrLoc);
			
				gc.bindBuffer(gc.ARRAY_BUFFER, clipPositionBuffer);
				// Tell the attribute how to get data out of the clipPositionBuffer
				{
					let size = 2; // 2 components per iteration
					let type = gc.FLOAT; // component type
					let normalize = false; // don't normalize the data
					let stride = 0; // 0 = size * sizeof(type)
					let offset = 0; // start at the beginning of the buffer
					gc.vertexAttribPointer(clipPositionAttrLoc, size, type, normalize, stride, offset);
				}
		
				{
					let primitiveType = gc.TRIANGLES;
					let offset = 0;
					let count = 3;
					gc.drawArrays(primitiveType, offset, count);
				}
			}	
		}

		function initDemo2(canvas) {
			let gc = initGraphicsContext(canvas);
			let program = createProgram(gc, screenSpaceVertexShaderSrc, constFragmentShaderSrc);
		
			let screenSizeUniformLoc = gc.getUniformLocation(program, "screenSize");
			
			let screenPositionAttrLoc = gc.getAttribLocation(program, "screenPosition");
			let screenPositionBuffer = gc.createBuffer();
			gc.bindBuffer(gc.ARRAY_BUFFER, screenPositionBuffer);
			let screenPositions = [
				10, 20, 80, 20, 10, 30,
				10, 30, 80, 20, 80, 30,
			];
			gc.bufferData(gc.ARRAY_BUFFER, new Float32Array(screenPositions), gc.STATIC_DRAW);
		
			setInterval(() => {
				resizeCanvasToDisplaySize(gc.canvas);
				gc.viewport(0, 0, gc.canvas.width, gc.canvas.height);

				gc.clearColor(backgroundRgb[0], backgroundRgb[1], backgroundRgb[2], 1);
				gc.clear(gc.COLOR_BUFFER_BIT);

				gc.useProgram(program);

				gc.uniform2f(screenSizeUniformLoc, gc.canvas.width, gc.canvas.height);

				gc.enableVertexAttribArray(screenPositionAttrLoc);
				gc.bindBuffer(gc.ARRAY_BUFFER, screenPositionBuffer);
				{
					let size=2, type=gc.FLOAT, normalize=false, stride=0, ptrOffset = 0;
					gc.vertexAttribPointer(screenPositionAttrLoc, size, type, normalize, stride, ptrOffset);

					let primitiveType=gc.TRIANGLES, drawOffset=0, count=6;
					gc.drawArrays(primitiveType, drawOffset, count);
				}
			}, 1000/60);
		}

		function initUniformColorDemo(canvas) {
			const {gc, program} = initGlCanvas(canvas, screenSpaceVertexShaderSrc, uniformColorFragSrc);
			const vs = setupScreenSpaceVertexShader(gc, program);
			const colorUniformLocation = gc.getUniformLocation(program, "color");

			const tick = () => {
				resizeCanvasToDisplaySize(gc.canvas);
				const screenWidth = gc.canvas.width;
				const screenHeight = gc.canvas.height;
				gc.viewport(0, 0, screenWidth, screenHeight);

				gc.clearColor(backgroundRgb[0], backgroundRgb[1], backgroundRgb[2], 1);
				gc.clear(gc.COLOR_BUFFER_BIT);

				gc.useProgram(program);

				vs.setScreenSize(screenWidth, screenHeight);

				for (let i=0; i < 50; ++i) {
					gc.uniform4f(colorUniformLocation, Math.random(), Math.random(), Math.random(), 1.0);
				
					const rx = Math.random()*(screenWidth-1);
					const ry = Math.random()*(screenHeight-1);
					vs.loadRectData(rx, ry, Math.random()*(screenWidth-rx), Math.random()*(screenHeight-ry))
					vs.drawTriangles();	
				}
			};

			tick();
			
			// setInterval(tick, 1000/60);
		}

	} catch (err) {
		msgEl.innerHTML = err;
	}

}, false);

function initGlCanvas(canvas, vertexSrc, fragmentSrc) {
	let gc = initGraphicsContext(canvas);
	return { gc, program: createProgram(gc, vertexSrc, fragmentSrc) };
}

function createShader(gc, type, source) {
	let shader = gc.createShader(type);
	gc.shaderSource(shader, source);
	gc.compileShader(shader);
	let success = gc.getShaderParameter(shader, gc.COMPILE_STATUS);
	if (success) {
		return shader;
	}

	let infoLog = gc.getShaderInfoLog(shader);
	gc.deleteShader(shader);
	throw new Error(infoLog);
}

function createProgram(gc, vertexShader, fragmentShader) {
	if (typeof(vertexShader) === "string") {
		vertexShader = createShader(gc, gc.VERTEX_SHADER, vertexShader);
	}

	if (typeof(fragmentShader) === "string") {
		fragmentShader = createShader(gc, gc.FRAGMENT_SHADER, fragmentShader);
	}
		
	let program = gc.createProgram();
	gc.attachShader(program, vertexShader);
	gc.attachShader(program, fragmentShader);
	gc.linkProgram(program);
	let success = gc.getProgramParameter(program, gc.LINK_STATUS);
	if (success) {
		return program;
	}

	let errorInfo = gc.getProgramInfoLog(program);
	gc.deleteProgram(program);
	throw new Error(errorInfo);
}

function resizeCanvasToDisplaySize(canvas) {
	const dpr = window.devicePixelRatio;
	const {width, height} = canvas.getBoundingClientRect();
	const displayWidth = Math.round(width * dpr);
	const displayHeight = Math.round(height * dpr);

	if (canvas.width != displayWidth || canvas.height != displayHeight) {
		canvas.width = canvas.clientWidth;
		canvas.height = canvas.clientHeight;

		return true;
	}

	return false;
}

function initGraphicsContext(canvas) {
	const gc = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
	if (!(gc instanceof WebGLRenderingContext)) {
		throw new Error(`Failed to initialize WebGL context for canvas ${canvas.id}.`);
	}

	return gc;
}
