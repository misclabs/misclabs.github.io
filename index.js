window.addEventListener("load", function indexLoad(evt) {
	"use strict"
	try {
		window.removeEventListener(evt.type, indexLoad, false);

		let bgCnvs = document.querySelector("#bgCnvs");
		let vertSrc = document.querySelector("#vertSrc").text;
		let fragSrc = document.querySelector("#fragSrc").text;

		let {gc, prog} = mglInitCnvs(bgCnvs, vertSrc, fragSrc);
		
		let scrSzLoc = gc.getUniformLocation(prog, "scrSz");
		let colLoc = gc.getUniformLocation(prog, "col");
		let scrPosLoc = gc.getAttribLocation(prog, "scrPos");
		let scrPosBuf = gc.createBuffer();
		
		function loadRectData(x, y, w, h) {
			const x2=x+w, y2=y+h;
			let tris = new Float32Array([
				x, y,  x2, y, x2, y2,
				x, y2, x, y,  x2, y2,
			]);
			gc.bindBuffer(gc.ARRAY_BUFFER, scrPosBuf);
			gc.bufferData(gc.ARRAY_BUFFER, tris, gc.STATIC_DRAW);		
		}
		function drawTris(nTris) {
			gc.enableVertexAttribArray(scrPosLoc);
			gc.bindBuffer(gc.ARRAY_BUFFER, scrPosBuf);
			gc.vertexAttribPointer(scrPosLoc, 2, gc.FLOAT, false, 0, 0);
			gc.drawArrays(gc.TRIANGLES, 0, nTris*3);	
		}

		function rgb256ToRgbF(r, g, b) { return [r/256.0, g/256.0, b/256.0] }
		let rCols = [
			// rgb256ToRgbF(179, 212, 255),
			// rgb256ToRgbF(103, 169, 255),
			rgb256ToRgbF(90, 106, 127),
			rgb256ToRgbF(33, 74, 127),
			rgb256ToRgbF(26, 26, 26),
		];

		// returns [min, max)
		function randInt(min, max) {
			return Math.floor(Math.random() * (max-min) + min);
		}
		
		const minRect = 10;
		const maxRect = 50;
		const durMs = 5*1000;
		const dtMs = 1000/10;
		let tMs = 0;
		let tickId = setInterval(() => {
			const prgrss = (durMs-tMs)/durMs;

			mglUpdateCnvsSz(gc.canvas);
			let scrW = gc.canvas.width;
			let scrH = gc.canvas.height;
			gc.viewport(0, 0, scrW, scrH);

			gc.clearColor(0, 0, 0, 0);
			gc.clear(gc.COLOR_BUFFER_BIT);

			gc.useProgram(prog);
			gc.uniform2f(scrSzLoc, scrW, scrH);
			let col;
			let rCnt = minRect + (maxRect-minRect)*(prgrss);
			for (let i=0; i < rCnt; ++i) {
				col = rCols[randInt(0, rCols.length)];
				gc.uniform4f(colLoc, col[0]*prgrss, col[1]*prgrss, col[2]*prgrss, prgrss);
			
				let x1 = Math.random()*scrW;
				let x2 = Math.random()*scrW;
				if (x2 > x1) { let t=x1; x1=x2; x2=t }

				let y1 = Math.random()*scrH;
				let y2 = Math.random()*scrH;
				if (y2 > y1) { let t=y1; y1=y2, y2=t }

				loadRectData(x1, y1, x2-x1, y2-y1);
				drawTris(2);	
			}

			tMs += dtMs;
			if (tMs >= durMs) { 
				clearInterval(tickId);
				gc.clearColor(0, 0, 0, 0);
				gc.clear(gc.COLOR_BUFFER_BIT);
				gc.canvas.parentNode.removeChild(gc.canvas);
			}
		}, dtMs);
	} catch (err) { console.error(err); }
}, false);
