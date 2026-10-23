import * as THREE from 'three';

/** Demonstration time, already scaled by playback speed; no player-body calibration. */
export function sampleGhostOpacity(elapsedMs:number,durationMs:number):number {
 if(!Number.isFinite(elapsedMs)||!Number.isFinite(durationMs)||durationMs<=0||elapsedMs<=0||elapsedMs>=durationMs)return 0;
 const t=Math.min(1,elapsedMs/160,(durationMs-elapsedMs)/200);
 return t*t*(3-2*t);
}

/** Sparse authored contours avoid the triangulated wireframe/mannequin appearance. */
export function createGhostArm(side:-1|1) {
 const group=new THREE.Group();group.name=side<0?'ghost-left':'ghost-right';
 const ink=new THREE.LineBasicMaterial({color:0xffffff,transparent:true,opacity:0,depthWrite:false});
 const highlight=new THREE.LineBasicMaterial({color:0xfff8e9,transparent:true,opacity:0,depthWrite:false});
 const body=new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:0,depthWrite:false});
 const line=(points:THREE.Vector3[],closed=false,material=ink)=>{
  const geometry=new THREE.BufferGeometry().setFromPoints(points);
  const shape=closed?new THREE.LineLoop(geometry,material):new THREE.Line(geometry,material);
  group.add(shape);return shape;
 };
 const ellipse=(center:THREE.Vector3,radii:THREE.Vector3,plane:'xy'|'xz'|'yz',start=0,end=Math.PI*2)=>Array.from({length:33},(_,i)=>{
  const a=start+(end-start)*i/32,c=Math.cos(a),s=Math.sin(a);
  return new THREE.Vector3(center.x+(plane==='yz'?0:radii.x*c),center.y+(plane==='xy'?radii.y*s:plane==='yz'?radii.y*c:0),center.z+(plane==='xy'?0:radii.z*s));
 });
 const forearm=new THREE.Mesh(new THREE.CylinderGeometry(.073,.105,.65,10),body);
 forearm.rotation.x=Math.PI/2;forearm.position.z=.36;group.add(forearm);
 // Two tapering sleeve contours and a lightly broken cuff ellipse.
 for(const edge of [-1,1])line([new THREE.Vector3(edge*.105,-.008,.685),new THREE.Vector3(edge*.09,.008,.48),new THREE.Vector3(edge*.073,0,.13)]);
 line(ellipse(new THREE.Vector3(0,0,.13),new THREE.Vector3(.09,.075,0),'xy'),true);
 line(ellipse(new THREE.Vector3(0,0,.205),new THREE.Vector3(.083,.07,0),'xy',.15,Math.PI*1.8));
 const glove=new THREE.Mesh(new THREE.SphereGeometry(.155,12,10),body);
 glove.scale.set(1,.9,1.25);group.add(glove);
 // Rounded knuckles, front/back profile and center knuckle seam define a boxing glove.
 line(ellipse(new THREE.Vector3(0,0,0),new THREE.Vector3(.155,.1395,.194),'xy'),true);
 // Side silhouette stays readable when the glove's forward axis points upward.
 const guardProfile=line(ellipse(new THREE.Vector3(0,0,0),new THREE.Vector3(.155,0,.194),'xz'),true);
 guardProfile.visible=false;
 line(ellipse(new THREE.Vector3(0,.025,-.135),new THREE.Vector3(.112,.075,0),'xy',.05,Math.PI*.95),false,highlight);
 const thumbCenter=new THREE.Vector3(-side*.123,-.065,.025);
 line(ellipse(thumbCenter,new THREE.Vector3(.064,.082,0),'xy'),true);
 line([new THREE.Vector3(-side*.08,-.12,.09),new THREE.Vector3(-side*.09,-.055,.035),new THREE.Vector3(-side*.055,-.015,-.055)]);
 group.visible=false;
 return {group,setGuardPose(upright:boolean){group.rotation.x=upright?Math.PI/2:0;guardProfile.visible=upright;},setOpacity(opacity:number){
  const alpha=Number.isFinite(opacity)?THREE.MathUtils.clamp(opacity,0,1):0;
  group.visible=alpha>0;ink.opacity=alpha*.92;highlight.opacity=alpha*.48;body.opacity=alpha*.018;
 }};
}
