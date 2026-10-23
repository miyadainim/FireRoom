import type {ForwardDepthMode} from '../vision/forward-depth';
const key='fireroom.forward-depth.v1';
export function forwardDepthMode():ForwardDepthMode {try{const value=localStorage.getItem(key);return value==='shadow'||value==='assist'?value:'off';}catch{return 'off';}}
/** Reloading resets active lesson/round history; existing phone pairing is retained. */
export function mountForwardDepthControls(root:HTMLElement){
 const section=document.createElement('section');section.innerHTML='<h3>Experimental forward-motion evidence</h3><p>Estimated 3D evidence is unvalidated. Guard checks remain 2D. Applying restarts this view and any current attempt; phone pairing stays connected.</p><label>Detector mode <select><option value="off">Original 2D · experiment off</option><option value="shadow">3D comparison only · no recognition changes</option><option value="assist">3D assist · experimental recognition</option></select></label><button>Apply detector mode & restart view</button><p data-depth-status></p>';
 const select=section.querySelector('select')!;select.value=forwardDepthMode();section.querySelector('[data-depth-status]')!.textContent=`Current mode: ${select.selectedOptions[0].textContent}`;
 section.querySelector('button')!.onclick=()=>{try{localStorage.setItem(key,select.value);location.reload();}catch{section.querySelector('[data-depth-status]')!.textContent='Could not save the setting. Original mode remains available.';}};root.append(section);
}
