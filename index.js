window.addEventListener("load",function pgLd(evnt){
	"use strict"
	window.removeEventListener(evnt.type,pgLd,false)
	let splshA=this.document.querySelector("#splshA")
	let img=document.createElement("img")
	img.setAttribute("src","misc_labs_logo.svg")
	img.style.visibility="hidden"
	splshA.appendChild(img)
	let cnvs=document.createElement("canvas")
	cnvs.style.visibility="hidden"
	splshA.appendChild(cnvs)
	let dc=mglNewDc(cnvs)
	dc.clrCol=[26/256.0,26/256.0,26/256.0,1]
	let {w,h}=dc.scrSz()
	let rects=[],cw=w/16.0,ch=h/9.0
	for(let i=0; i<16; ++i){
		for(let j=0; j<9; ++j){
			rects.push({
				x:i*cw+cw/2,y:j*ch+ch/2,
				w:cw,h:ch, s:0,r:0})
		}
	}
	let tckr=mscNewTckr()
	let twn=mesNewTwn(3,0,1,mesUpdtOnc,mesSmthStop4)
	let tickId=setInterval(()=>{
		tckr.tck()
		let val=mesTckTwn(twn,tckr.dtS)
		dc.begin()
		for (let i=0; i < rects.length; ++i){
			rects[i].s=val*1.1
			rects[i].r=-(1-val)*Math.PI/2.0
			dc.rect(rects[i].x,rects[i].y,
				rects[i].w,rects[i].h, rects[i].r, rects[i].s,
				[0,0,0,0])
		}
		dc.end()
		img.style.visibility="visible"
		cnvs.style.visibility="visible"
		if(val>=1){
			clearInterval(tickId)
			dc.begin();dc.end()
			cnvs.parentNode.removeChild(cnvs)
		}
	}, 1000/60)
})
