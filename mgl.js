// mgl Misc. Graphics Library

function mglInitCnvs(cnvs, vertSrc, fragSrc) {
	let gc = cnvs.getContext("webgl") || cnvs.getContext("experimental-webgl");
	if (!gc) { throw new Error(`Failed to initialize WebGL context for canvas ${cnvs.id}.`); }
	return { gc, prog: mglInitProg(gc, vertSrc, fragSrc) };
}

function mglInitProg(gc, vertShdr, fragShdr) {
	if (typeof(vertShdr) === "string") { vertShdr = mglInitShdr(gc, gc.VERTEX_SHADER, vertShdr); }
	if (typeof(fragShdr) === "string") { fragShdr = mglInitShdr(gc, gc.FRAGMENT_SHADER, fragShdr); }
	let prog = gc.createProgram();
	gc.attachShader(prog, vertShdr);
	gc.attachShader(prog, fragShdr);
	gc.linkProgram(prog);
	if (gc.getProgramParameter(prog, gc.LINK_STATUS)) { return prog; }

	let log = gc.getProgramInfoLog(prog);
	gc.deleteProgram(prog);
	throw new Error(log);
}

function mglInitShdr(gc, type, src) {
	let shdr = gc.createShader(type);
	gc.shaderSource(shdr, src);
	gc.compileShader(shdr);
	if (gc.getShaderParameter(shdr, gc.COMPILE_STATUS)) { return shdr; }

	let log = gc.getShaderInfoLog(shdr);
	gc.deleteShader(shdr);
	throw new Error(log);
}

function mglUpdateCnvsSz(cnvs) {
	const dpr = window.devicePixelRatio;
	const {width, height} = cnvs.getBoundingClientRect();
	if (cnvs.width != Math.round(width * dpr) || cnvs.height != Math.round(height * dpr)) {
		cnvs.width = cnvs.clientWidth;
		cnvs.height = cnvs.clientHeight;
	}
}
