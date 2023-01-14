window.addEventListener("load",function idxLd(evt){
	"use strict"
	window.removeEventListener(evt.type,idxLd,false)
	let cnvs=document.querySelector("#bgCnvs")
	let dc=mglNewDc(cnvs)
	//dc.clrCol=[0,0,0,1]
	function rgb256ToRgbF(r,g,b){return [r/256.0,g/256.0,b/256.0]}
	let rCols=[
		// rgb256ToRgbF(179,212,255), rgb256ToRgbF(103,169,255),
		rgb256ToRgbF(90,106,127), rgb256ToRgbF(33,74,127), rgb256ToRgbF(26,26,26)
	]
	dc.clrCol=[26/256.0,26/256.0,26/256.0,1]

	// returns [min, max)
	function randInt(min,max){return Math.floor(Math.random() * (max-min) + min)}

	let {w,h}=dc.scrSz()
	let rects=[],cw=w/16.0,ch=h/9.0
	for(let i=0; i<16; ++i){
		for(let j=0; j<9; ++j){
			rects.push({
				x:i*cw+cw/2,y:j*ch+ch/2,
				w:cw,h:ch, s:0,r:0})
		}
	}
	
	let strtTsMs=performance.now()
	let prvTsMs=strtTsMs
	let tickId=setInterval(()=>{
		let tsMs=performance.now()
		let dtMs=tsMs-prvTsMs
		dc.begin()
		for (let i=0; i < rects.length; ++i){
			rects[i].s=Math.min(rects[i].s+dtMs/1000.0,2)
			rects[i].r=(rects[i].r+dtMs/1000.0)%360
			dc.rect(rects[i].x,rects[i].y,
				rects[i].w,rects[i].h, rects[i].r, rects[i].s,
				[0,0,0,0])
		}
		dc.end()
		prvTsMs=tsMs;

		if(tsMs>=strtTsMs+5000){
			clearInterval(tickId)
			dc.begin();dc.end()
			cnvs.parentNode.removeChild(cnvs)
		}
	}, 1000/30)
})
