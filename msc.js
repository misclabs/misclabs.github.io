function mscNewTckr(){
	let strtS=performance.now()/1000.0-Number.MIN_VALUE
	let pub={
		dtS:0,
		tmS:0,
		tck:()=>{
			let t=performance.now()/1000.0-strtS
			pub.dtS=t-pub.tmS
			pub.tmS=t
		}
	}
	return pub
}
function mscRgb256ToRgbF(r,g,b){return [r/256.0,g/256.0,b/256.0]}
// mscRndmInt returns [mn, mx)
function mscRndmInt(mn,mx){return Math.floor(Math.random()*(mx-mn)+mn)}
