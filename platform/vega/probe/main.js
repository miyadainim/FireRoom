import * as THREE from '../../../node_modules/three/build/three.module.js';
if (!window.__fireRoomProbe) {
 window.__fireRoomProbe = true;
 document.head.innerHTML='<meta name="viewport" content="width=device-width, initial-scale=1">';
 document.body.innerHTML = `<style>body{margin:0;background:#101827;color:white;font:24px sans-serif}canvas{float:right;width:60vw!important;height:75vh!important}button{font:24px sans-serif;margin:12px;padding:18px}button:focus{outline:6px solid orange}pre{font:18px monospace;white-space:pre-wrap}</style><h1>FireRoom Vega WebGL2 probe</h1><p>Trusted HTTPS loaded; JavaScript running; Three.js r${THREE.REVISION}</p><button id="one">Select test A</button><button id="two">Select test B</button><pre id="status"></pre><pre id="keys">Remote events: none</pre>`;
 const status=document.querySelector('#status');
 const report=(data)=>{status.textContent += JSON.stringify(data)+'\n'; console.log('FIREROOM_PROBE',JSON.stringify(data)); window.ReactNativeWebView?.postMessage(JSON.stringify(data));};
 window.addEventListener('error',e=>report({error:e.message}));
 window.addEventListener('unhandledrejection',e=>report({rejection:String(e.reason)}));
 document.addEventListener('focusin',e=>window.ReactNativeWebView?.postMessage(JSON.stringify({focus:e.target.id})));
 document.addEventListener('keydown',e=>{document.querySelector('#keys').textContent=`Remote: ${e.key} (${e.keyCode})`;window.ReactNativeWebView?.postMessage(JSON.stringify({key:e.key,keyCode:e.keyCode}));if(e.keyCode>=37 && e.keyCode<=40){e.preventDefault();const buttons=[...document.querySelectorAll('button')];const i=buttons.indexOf(document.activeElement);buttons[(i+(e.keyCode===37||e.keyCode===38?-1:1)+buttons.length)%buttons.length].focus();}if(e.keyCode===27)e.preventDefault();});
 document.querySelectorAll('button').forEach(b=>b.onclick=()=>{document.querySelector('#keys').textContent=`Selected ${b.id}`;window.ReactNativeWebView?.postMessage(JSON.stringify({selected:b.id}));});
 try {
  const canvas=document.createElement('canvas');document.body.append(canvas);
  const gl=canvas.getContext('webgl2');report({https:location.protocol==='https:',js:true,webgl2:!!gl,version:gl?.getParameter(gl.VERSION),vendor:gl?.getParameter(gl.VENDOR)});
  if(!gl)throw Error('WebGL2 unavailable');
  canvas.addEventListener('webglcontextlost',()=>report({contextLost:true}));
  const renderer=new THREE.WebGLRenderer({canvas,context:gl,antialias:false});renderer.setSize(960,600);renderer.debug.checkShaderErrors=true;
  const scene=new THREE.Scene();scene.background=new THREE.Color('#223044');
  const camera=new THREE.PerspectiveCamera(50,960/600,.1,100);camera.position.set(0,1.5,5);camera.lookAt(0,0,0);
  scene.add(new THREE.HemisphereLight(0xffffff,0x333344,3));
  const bag=new THREE.Mesh(new THREE.CylinderGeometry(.55,.55,1.8,20),new THREE.MeshStandardMaterial({color:0xcc4933}));scene.add(bag);
  const floor=new THREE.Mesh(new THREE.BoxGeometry(5,.1,4),new THREE.MeshStandardMaterial({color:0x778899}));floor.position.y=-1;scene.add(floor);
  let frames=0;function tick(){bag.rotation.z=Math.sin(frames/45)*.1;renderer.render(scene,camera);frames++;if(frames===60){report({renderedFrames:frames,drawCalls:renderer.info.render.calls,glError:gl.getError()});window.ReactNativeWebView?.postMessage(JSON.stringify({canvasPng:canvas.toDataURL('image/png')}));}requestAnimationFrame(tick);}tick();document.querySelector('button').focus();
 } catch(e){report({failure:String(e)});}
}
