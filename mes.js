// Misc. Easing Steroids

function mesNewTwn(durS,strt,end,updtFn,esFn){
	return {durS,strt,end,updtFn,esFn,tS:0,dir:1.0}
}
function mesTckTwn(twn,dtS){
	twn.updtFn(twn,dtS)
	return twn.strt+(twn.end-twn.strt)*twn.esFn(twn.tS/twn.durS)
}
function mesUpdtOnc(twn,dtS){
	if (twn.tS >= twn.durS) return
	twn.tS=Math.min(twn.durS,twn.tS+dtS)
}
function mesUpdtPngPng(twn,dtS){
	twn.tS+=dtS*twn.dir
	if(twn.tS>twn.durS) {
		twn.dir=-1.0
		twn.tS=twn.durS-(twn.tS-twn.durS)
	} else if(twn.tS<0) {
		twn.dir=1.0
		twn.tS=-twn.tS
	}
}
function mesMix(a,b,w,t){return (1-w)*a(t)+w*b(t)}
function mesCrssFd(a,b,t){return (1-t)*a(t)+t*b(t)}
function mesSmthStrt2(t){return t*t}
function mesSmthStrt3(t){return t*t*t}
function mesSmthStrt4(t){return t*t*t*t}
function mesSmthStrt5(t){return t*t*t*t*t}
function mesSmthStrt6(t){return t*t*t*t*t*t}
function mesSmthStop2(t){t=1-t;return 1-t*t}
function mesSmthStop3(t){t=1-t;return 1-t*t*t}
function mesSmthStop4(t){t=1-t;return 1-t*t*t*t}
function mesSmthStop5(t){t=1-t;return 1-t*t*t*t*t}
function mesSmthStop6(t){t=1-t;return 1-t*t*t*t*t*t}
function mesSmthStep2(t){return mesCrssFd(mesSmthStrt2,mesSmthStop2,t)}
function mesSmthStep3(t){return mesCrssFd(mesSmthStrt3,mesSmthStop3,t)}
function mesSmthStep4(t){return mesCrssFd(mesSmthStrt4,mesSmthStop4,t)}
function mesSmthStep5(t){return mesCrssFd(mesSmthStrt5,mesSmthStop5,t)}
function mesSmthStep6(t){return mesCrssFd(mesSmthStrt6,mesSmthStop6,t)}
function mesArch2(t){return 4*t*(1-t)}
//function mesBllCrv6(t){return mesSmthStop3(t)*mesSmthStrt3(t)}
