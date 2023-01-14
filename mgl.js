// mgl Misc. Graphics Library
function mglInitCnvs(cnvs,vertSrc,fragSrc){
	let gc = cnvs.getContext("webgl") || cnvs.getContext("experimental-webgl")
	if(!gc){throw new Error(`Failed to initialize WebGL context for canvas ${cnvs.id}.`)}
	return {gc,prog:mglInitProg(gc,vertSrc,fragSrc)}
}
function mglInitProg(gc,vertShdr,fragShdr){
	if(typeof(vertShdr)==="string"){vertShdr=mglInitShdr(gc,gc.VERTEX_SHADER,vertShdr)}
	if(typeof(fragShdr)==="string"){fragShdr=mglInitShdr(gc,gc.FRAGMENT_SHADER,fragShdr)}
	let prog=gc.createProgram()
	gc.attachShader(prog,vertShdr)
	gc.attachShader(prog,fragShdr)
	gc.linkProgram(prog)
	if(gc.getProgramParameter(prog,gc.LINK_STATUS)){return prog}
	let log=gc.getProgramInfoLog(prog)
	gc.deleteProgram(prog)
	throw new Error(log)
}
function mglNewDc(cnvs){
	let {gc,prog}=mglInitCnvs(cnvs,
		"uniform vec2 scrSz;uniform vec4 trans;attribute vec2 scrPos;void main(){/* Scale */ vec2 pos=scrPos*trans.w; /* Rotate */ vec2 r=vec2(sin(trans.z),cos(trans.z)); pos=vec2(pos.x*r.y+pos.y*r.x, pos.y*r.y-pos.x*r.x); /* Translate */ pos=pos+trans.xy; /* Clip space */ pos=((pos / scrSz) * 2.0) - 1.0; gl_Position=vec4(pos * vec2(1, -1), 0, 1); }",
		"precision mediump float;uniform vec4 col;void main(){gl_FragColor=col;}")
	mglUpdateCnvsSz(cnvs)
	let scrSzLoc=gc.getUniformLocation(prog,"scrSz")
	let colLoc=gc.getUniformLocation(prog,"col")
	let transLoc=gc.getUniformLocation(prog,"trans")
	let posLoc=gc.getAttribLocation(prog,"scrPos")
	let posBuf=gc.createBuffer()
	let posDt=[],objs=[]
	let bDrw=false
	let pub={
		clrCol:[0,0,0,1],
		begin:function(){
			if(bDrw){throw new Error("Already began drawing")}
			bDrw=true
			mglUpdateCnvsSz(gc.canvas)
			let {w:sw,h:sh}=pub.scrSz()
			gc.viewport(0,0,sw,sh)
			gc.clearColor(pub.clrCol[0],pub.clrCol[1],pub.clrCol[2],pub.clrCol[3])
			gc.clear(gc.COLOR_BUFFER_BIT)
			gc.useProgram(prog)
			gc.uniform2f(scrSzLoc, sw,sh)
		},
		end:function(){
			if (!bDrw) {throw new Error("Drawing never began")}
			function initAttr(loc, buf, dt, cTyp, cCnt, cNrm=false){
				gc.bindBuffer(gc.ARRAY_BUFFER,buf)
				gc.enableVertexAttribArray(loc)
				gc.vertexAttribPointer(loc, cCnt, cTyp, cNrm, 0, 0)
				gc.bufferData(gc.ARRAY_BUFFER,dt,gc.DYNAMIC_DRAW)
			}
			initAttr(posLoc, posBuf, new Float32Array(posDt), gc.FLOAT, 2)
			for (let i=0; i<objs.length; ++i) {
				gc.uniform4fv(colLoc, objs[i].col4fv)
				gc.uniform4fv(transLoc, objs[i].trans)
				gc.drawArrays(gc.TRIANGLES,objs[i].dtStrt,objs[i].dtCnt)
			}
			posDt.length=0
			objs.length=0
			bDrw=false
		},
		scrSz:function(){return{w:gc.canvas.width,h:gc.canvas.height}},
		tri:function(x1,y1, x2,y2, x3,y3, col4fv){
			objs.push({dtStrt:posDt.length/2,dtCnt:3,col4fv,trans:[0,0,0,1]})
			posDt.push(x1,y1, x2,y2, x3,y3)
		},
		rect:function(x,y, w,h, rot, s, col4fv){
			let lt=[-w/2.0,-h/2.0]
			let br=[w/2.0,h/2.0]
			objs.push({dtStrt:posDt.length/2,dtCnt:6,col4fv,trans:[x,y,rot,s]})
			posDt.push(
				lt[0],lt[1], w/2.0,-h/2.0, br[0],br[1],
				lt[0],lt[1], br[0],br[1], -w/2.0,h/2.0)
		}
	}
	return pub
}
function mglInitShdr(gc,type,src){
	let shdr=gc.createShader(type)
	gc.shaderSource(shdr,src)
	gc.compileShader(shdr)
	if(gc.getShaderParameter(shdr,gc.COMPILE_STATUS)){return shdr}
	let log=gc.getShaderInfoLog(shdr)
	gc.deleteShader(shdr)
	throw new Error(log)
}
function mglUpdateCnvsSz(cnvs){
	const dpr=window.devicePixelRatio
	const {width,height}=cnvs.getBoundingClientRect()
	if (cnvs.width!=Math.round(width*dpr) || cnvs.height!=Math.round(height*dpr)){
		cnvs.width=cnvs.clientWidth
		cnvs.height=cnvs.clientHeight
	}
}
