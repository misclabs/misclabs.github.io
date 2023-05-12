(()=>{"use strict";function t(t,r){t.tS>=t.durS||(t.tS=Math.min(t.durS,t.tS+r))}function r(t){return 1-(t=1-t)*t*t*t}function e(t,r,e){"string"==typeof r&&(r=n(t,t.VERTEX_SHADER,r)),"string"==typeof e&&(e=n(t,t.FRAGMENT_SHADER,e));var o=t.createProgram();if(t.attachShader(o,r),t.attachShader(o,e),t.linkProgram(o),t.getProgramParameter(o,t.LINK_STATUS))return o;var i=t.getProgramInfoLog(o);throw t.deleteProgram(o),new Error(i)}function n(t,r,e){var n=t.createShader(r);if(t.shaderSource(n,e),t.compileShader(n),t.getShaderParameter(n,t.COMPILE_STATUS))return n;var o=t.getShaderInfoLog(n);throw t.deleteShader(n),new Error(o)}function o(t){var r=window.devicePixelRatio,e=t.getBoundingClientRect(),n=e.width,o=e.height;t.width==Math.round(n*r)&&t.height==Math.round(o*r)||(t.width=t.clientWidth,t.height=t.clientHeight)}window.addEventListener("load",(function n(i){window.removeEventListener(i.type,n,!1);var a=this.document.querySelector("#splshA"),c=document.createElement("img");c.alt='An abstract blue and pink repesentation of a caffeine molecule with squares, hearts, and the text "Misc. Labs"',c.width=512,c.height=256,c.style.visibility="hidden",c.onload=function(){var n=document.createElement("canvas");n.style.visibility="hidden",a.appendChild(n);var i=function(t){var r=function(t,r,n){var o=t.getContext("webgl")||t.getContext("experimental-webgl");if(!o)throw new Error("Failed to initialize WebGL context for canvas ".concat(t.id,"."));return{gc:o,prog:e(o,"uniform vec2 scrSz;uniform vec4 trans;attribute vec2 scrPos;void main(){/* Scale */ vec2 pos=scrPos*trans.w; /* Rotate */ vec2 r=vec2(sin(trans.z),cos(trans.z)); pos=vec2(pos.x*r.y+pos.y*r.x, pos.y*r.y-pos.x*r.x); /* Translate */ pos=pos+trans.xy; /* Clip space */ pos=((pos / scrSz) * 2.0) - 1.0; gl_Position=vec4(pos * vec2(1, -1), 0, 1); }","precision mediump float;uniform vec4 col;void main(){gl_FragColor=col;}")}}(t),n=r.gc,i=r.prog;o(t);var a=n.getUniformLocation(i,"scrSz"),c=n.getUniformLocation(i,"col"),s=n.getUniformLocation(i,"trans"),l=n.getAttribLocation(i,"scrPos"),d=n.createBuffer(),h=[],u=[],v=!1,f={clrCol:[0,0,0,1],begin:function(){if(v)throw new Error("Already began drawing");v=!0,o(n.canvas);var t=f.scrSz(),r=t.w,e=t.h;n.viewport(0,0,r,e),n.clearColor(f.clrCol[0],f.clrCol[1],f.clrCol[2],f.clrCol[3]),n.clear(n.COLOR_BUFFER_BIT),n.useProgram(i),n.uniform2f(a,r,e)},end:function(){if(!v)throw new Error("Drawing never began");!function(t,r,e,o,i){var a=arguments.length>5&&void 0!==arguments[5]&&arguments[5];n.bindBuffer(n.ARRAY_BUFFER,r),n.enableVertexAttribArray(t),n.vertexAttribPointer(t,i,o,a,0,0),n.bufferData(n.ARRAY_BUFFER,e,n.DYNAMIC_DRAW)}(l,d,new Float32Array(h),n.FLOAT,2);for(var t=0;t<u.length;++t)n.uniform4fv(c,u[t].col4fv),n.uniform4fv(s,u[t].trans),n.drawArrays(n.TRIANGLES,u[t].dtStrt,u[t].dtCnt);h.length=0,u.length=0,v=!1},scrSz:function(){return{w:n.canvas.width,h:n.canvas.height}},tri:function(t,r,e,n,o,i,a){u.push({dtStrt:h.length/2,dtCnt:3,col4fv:a,trans:[0,0,0,1]}),h.push(t,r,e,n,o,i)},rect:function(t,r,e,n,o,i,a){var c=[-e/2,-n/2],s=[e/2,n/2];u.push({dtStrt:h.length/2,dtCnt:6,col4fv:a,trans:[t,r,o,i]}),h.push(c[0],c[1],e/2,-n/2,s[0],s[1],c[0],c[1],s[0],s[1],-e/2,n/2)}};return f}(n);i.clrCol=[26/256,26/256,26/256,1];for(var s=i.scrSz(),l=s.w,d=s.h,h=[],u=l/16,v=d/9,f=0;f<16;++f)for(var g=0;g<9;++g)h.push({x:f*u+u/2,y:g*v+v/2,w:u,h:v,s:0,r:0});var m,S,p=(m=performance.now()/1e3-Number.MIN_VALUE,S={dtS:0,tmS:0,tck:function(){var t=performance.now()/1e3-m;S.dtS=t-S.tmS,S.tmS=t}}),w={durS:3,strt:0,end:1,updtFn:t,esFn:r,tS:0,dir:1},b=setInterval((function(){p.tck();var t=function(t,r){return t.updtFn(t,r),t.strt+(t.end-t.strt)*t.esFn(t.tS/t.durS)}(w,p.dtS);i.begin();for(var r=0;r<h.length;++r)h[r].s=1.1*t,h[r].r=-(1-t)*Math.PI/2,i.rect(h[r].x,h[r].y,h[r].w,h[r].h,h[r].r,h[r].s,[0,0,0,0]);i.end(),c.style.visibility="visible",n.style.visibility="visible",t>=1&&(clearInterval(b),i.begin(),i.end(),n.parentNode.removeChild(n))}),1e3/60)},a.appendChild(c),c.src="images/misclabs_logo_hero.svg"}))})();