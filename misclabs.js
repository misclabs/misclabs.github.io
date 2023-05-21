(() => {
  // code/msc.js
  function mscNewTckr() {
    let strtS = performance.now() / 1e3 - Number.MIN_VALUE;
    let pub = {
      dtS: 0,
      tmS: 0,
      tck: () => {
        let t = performance.now() / 1e3 - strtS;
        pub.dtS = t - pub.tmS;
        pub.tmS = t;
      }
    };
    return pub;
  }

  // code/mes.js
  function mesNewTwn(durS, strt, end, updtFn, esFn) {
    return { durS, strt, end, updtFn, esFn, tS: 0, dir: 1 };
  }
  function mesTckTwn(twn, dtS) {
    twn.updtFn(twn, dtS);
    return twn.strt + (twn.end - twn.strt) * twn.esFn(twn.tS / twn.durS);
  }
  function mesUpdtOnc(twn, dtS) {
    if (twn.tS >= twn.durS)
      return;
    twn.tS = Math.min(twn.durS, twn.tS + dtS);
  }
  function mesSmthStop4(t) {
    t = 1 - t;
    return 1 - t * t * t * t;
  }

  // code/mgl.js
  function mglInitCnvs(cnvs, vertSrc, fragSrc) {
    let gc = cnvs.getContext("webgl") || cnvs.getContext("experimental-webgl");
    if (!gc) {
      throw new Error(`Failed to initialize WebGL context for canvas ${cnvs.id}.`);
    }
    return { gc, prog: mglInitProg(gc, vertSrc, fragSrc) };
  }
  function mglInitProg(gc, vertShdr, fragShdr) {
    if (typeof vertShdr === "string") {
      vertShdr = mglInitShdr(gc, gc.VERTEX_SHADER, vertShdr);
    }
    if (typeof fragShdr === "string") {
      fragShdr = mglInitShdr(gc, gc.FRAGMENT_SHADER, fragShdr);
    }
    let prog = gc.createProgram();
    gc.attachShader(prog, vertShdr);
    gc.attachShader(prog, fragShdr);
    gc.linkProgram(prog);
    if (gc.getProgramParameter(prog, gc.LINK_STATUS)) {
      return prog;
    }
    let log = gc.getProgramInfoLog(prog);
    gc.deleteProgram(prog);
    throw new Error(log);
  }
  function mglNewDc(cnvs) {
    let { gc, prog } = mglInitCnvs(
      cnvs,
      "uniform vec2 scrSz;uniform vec4 trans;attribute vec2 scrPos;void main(){/* Scale */ vec2 pos=scrPos*trans.w; /* Rotate */ vec2 r=vec2(sin(trans.z),cos(trans.z)); pos=vec2(pos.x*r.y+pos.y*r.x, pos.y*r.y-pos.x*r.x); /* Translate */ pos=pos+trans.xy; /* Clip space */ pos=((pos / scrSz) * 2.0) - 1.0; gl_Position=vec4(pos * vec2(1, -1), 0, 1); }",
      "precision mediump float;uniform vec4 col;void main(){gl_FragColor=col;}"
    );
    mglUpdateCnvsSz(cnvs);
    let scrSzLoc = gc.getUniformLocation(prog, "scrSz");
    let colLoc = gc.getUniformLocation(prog, "col");
    let transLoc = gc.getUniformLocation(prog, "trans");
    let posLoc = gc.getAttribLocation(prog, "scrPos");
    let posBuf = gc.createBuffer();
    let posDt = [], objs = [];
    let bDrw = false;
    let pub = {
      clrCol: [0, 0, 0, 1],
      begin: function() {
        if (bDrw) {
          throw new Error("Already began drawing");
        }
        bDrw = true;
        mglUpdateCnvsSz(gc.canvas);
        let { w: sw, h: sh } = pub.scrSz();
        gc.viewport(0, 0, sw, sh);
        gc.clearColor(pub.clrCol[0], pub.clrCol[1], pub.clrCol[2], pub.clrCol[3]);
        gc.clear(gc.COLOR_BUFFER_BIT);
        gc.useProgram(prog);
        gc.uniform2f(scrSzLoc, sw, sh);
      },
      end: function() {
        if (!bDrw) {
          throw new Error("Drawing never began");
        }
        function initAttr(loc, buf, dt, cTyp, cCnt, cNrm = false) {
          gc.bindBuffer(gc.ARRAY_BUFFER, buf);
          gc.enableVertexAttribArray(loc);
          gc.vertexAttribPointer(loc, cCnt, cTyp, cNrm, 0, 0);
          gc.bufferData(gc.ARRAY_BUFFER, dt, gc.DYNAMIC_DRAW);
        }
        initAttr(posLoc, posBuf, new Float32Array(posDt), gc.FLOAT, 2);
        for (let i = 0; i < objs.length; ++i) {
          gc.uniform4fv(colLoc, objs[i].col4fv);
          gc.uniform4fv(transLoc, objs[i].trans);
          gc.drawArrays(gc.TRIANGLES, objs[i].dtStrt, objs[i].dtCnt);
        }
        posDt.length = 0;
        objs.length = 0;
        bDrw = false;
      },
      scrSz: function() {
        return { w: gc.canvas.width, h: gc.canvas.height };
      },
      tri: function(x1, y1, x2, y2, x3, y3, col4fv) {
        objs.push({ dtStrt: posDt.length / 2, dtCnt: 3, col4fv, trans: [0, 0, 0, 1] });
        posDt.push(x1, y1, x2, y2, x3, y3);
      },
      rect: function(x, y, w, h, rot, s, col4fv) {
        let lt = [-w / 2, -h / 2];
        let br = [w / 2, h / 2];
        objs.push({ dtStrt: posDt.length / 2, dtCnt: 6, col4fv, trans: [x, y, rot, s] });
        posDt.push(
          lt[0],
          lt[1],
          w / 2,
          -h / 2,
          br[0],
          br[1],
          lt[0],
          lt[1],
          br[0],
          br[1],
          -w / 2,
          h / 2
        );
      }
    };
    return pub;
  }
  function mglInitShdr(gc, type, src) {
    let shdr = gc.createShader(type);
    gc.shaderSource(shdr, src);
    gc.compileShader(shdr);
    if (gc.getShaderParameter(shdr, gc.COMPILE_STATUS)) {
      return shdr;
    }
    let log = gc.getShaderInfoLog(shdr);
    gc.deleteShader(shdr);
    throw new Error(log);
  }
  function mglUpdateCnvsSz(cnvs) {
    const dpr = window.devicePixelRatio;
    const { width, height } = cnvs.getBoundingClientRect();
    if (cnvs.width != Math.round(width * dpr) || cnvs.height != Math.round(height * dpr)) {
      cnvs.width = cnvs.clientWidth;
      cnvs.height = cnvs.clientHeight;
    }
  }

  // code/misclabs.jsx
  document.addEventListener("DOMContentLoaded", function onMainPageLoad(evnt) {
    "use strict";
    let copyright = document.getElementById("cr");
    copyright.addEventListener("click", () => {
      const vpW = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
      const vpH = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
      const scW = window.screen.width;
      const scH = window.screen.height;
      const bW = document.body.clientWidth;
      const bH = document.body.clientHeight;
      copyright.innerText = `scr:${scW},${scH} vp:${vpW},${vpH} b:${bW},${bH}`;
    });
    window.removeEventListener(evnt.type, onMainPageLoad, false);
    let splshA = document.querySelector("#splshA");
    let img = document.createElement("img");
    img.alt = 'An abstract blue and pink repesentation of a caffeine molecule with squares, hearts, and the text "Misc. Labs"';
    img.width = 512;
    img.height = 256;
    img.style.visibility = "hidden";
    img.onload = () => {
      let cnvs = document.createElement("canvas");
      cnvs.style.visibility = "hidden";
      splshA.appendChild(cnvs);
      let dc = mglNewDc(cnvs);
      dc.clrCol = [26 / 256, 26 / 256, 26 / 256, 1];
      let { w, h } = dc.scrSz();
      let rects = [], cw = w / 16, ch = h / 9;
      for (let i = 0; i < 16; ++i) {
        for (let j = 0; j < 9; ++j) {
          rects.push({
            x: i * cw + cw / 2,
            y: j * ch + ch / 2,
            w: cw,
            h: ch,
            s: 0,
            r: 0
          });
        }
      }
      let tckr = mscNewTckr();
      let twn = mesNewTwn(3, 0, 1, mesUpdtOnc, mesSmthStop4);
      let tickId = setInterval(() => {
        tckr.tck();
        let val = mesTckTwn(twn, tckr.dtS);
        dc.begin();
        for (let i = 0; i < rects.length; ++i) {
          rects[i].s = val * 1.1;
          rects[i].r = -(1 - val) * Math.PI / 2;
          dc.rect(
            rects[i].x,
            rects[i].y,
            rects[i].w,
            rects[i].h,
            rects[i].r,
            rects[i].s,
            [0, 0, 0, 0]
          );
        }
        dc.end();
        img.style.visibility = "visible";
        cnvs.style.visibility = "visible";
        if (val >= 1) {
          clearInterval(tickId);
          dc.begin();
          dc.end();
          cnvs.parentNode.removeChild(cnvs);
        }
      }, 1e3 / 60);
    };
    splshA.appendChild(img);
    img.src = "images/misclabs_logo_hero.svg";
  });
})();
