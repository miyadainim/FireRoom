(() => {
 const send=data=>window.ReactNativeWebView?.postMessage(JSON.stringify(data));
 const get=HTMLCanvasElement.prototype.getContext;
 HTMLCanvasElement.prototype.getContext=function(type,...args){const gl=get.call(this,type,...args);if(type==='webgl2' && gl)send({sceneWebgl2:true,version:gl.getParameter(gl.VERSION)});return gl;};
 window.addEventListener('error',e=>send({sceneError:e.message}));
 const error=console.error.bind(console);console.error=(...args)=>{send({consoleError:args.map(String).join(' ')});error(...args);};
 document.addEventListener('keydown',e=>send({sceneKey:e.key,code:e.keyCode,focus:document.activeElement?.id}));
 document.addEventListener('focusin',e=>send({sceneFocus:e.target.id||e.target.tagName}));
 document.addEventListener('DOMContentLoaded',()=>send({sceneDocumentReady:true}));
 const raf=window.requestAnimationFrame.bind(window);let frames=0;const captures=[];
 const schedule=()=>{const drill=document.querySelector('[data-prescribed="drill"]')?.value||"unknown";captures.push({at:frames+12,label:drill+"-early"},{at:frames+30,label:drill+"-late"});};
 document.addEventListener("click",e=>{if(e.target?.dataset?.prescribed==="demo")schedule();});
 document.addEventListener("change",e=>{if(e.target?.dataset?.prescribed==="drill")schedule();});
 window.requestAnimationFrame=callback=>raf(t=>{callback(t);frames++;for(const capture of captures.filter(c=>c.at===frames)){const c=document.querySelector("#scene");if(c)send({captureLabel:capture.label,canvasPng:c.toDataURL("image/png"),ghostLabel:document.querySelector("#ghostLabel")?.textContent});}if(frames===180){const c=document.querySelector('#scene');send({sceneFrames:frames,sceneCanvas:!!c,guideOpen:document.querySelector('#guidePanel')?.open,dialogue:!!document.querySelector('#question')});if(c)send({canvasPng:c.toDataURL('image/png')});}});
})();
