import * as THREE from 'three';
import type {CombatPhase} from '../game/arcade-combat-contracts';
import {finisherPose} from './arcade-finisher';
import {createArcadeRival} from './arcade-rival';
import {createArcadeGym} from './arcade-gym';
import {ArcadePlayerMotion} from './arcade-player-motion';

export interface ArcadeSceneState {
 opponentState:string;distance:number;phaseProgress?:number;opponentPunch?:'jab'|'cross';opponentHealth:number;playerHealth:number;guarding?:boolean;playerGuard?:'raised'|'lowered'|'unknown';handGuard?:Record<'left'|'right','raised'|'lowered'|'unknown'>;
 phase?:CombatPhase;cinematicProgress?:number;
 roundStatus?:string;result?:'win'|'loss'|'draw'|null;
}
/** Authored first-person presentation. Producer landmarks never position rendered fists. */
export function createArcadeScene(canvas:HTMLCanvasElement){
 const renderer=new THREE.WebGLRenderer({canvas,antialias:false,powerPreference:'low-power'});
 renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.5));renderer.outputColorSpace=THREE.SRGBColorSpace;
 const scene=new THREE.Scene();scene.background=new THREE.Color('#302c29');scene.fog=new THREE.Fog('#6c6051',9,21);
 const camera=new THREE.PerspectiveCamera(48,1,.07,32);camera.position.set(0,1.64,3.4);camera.lookAt(0,1.0,.15);
 scene.add(new THREE.HemisphereLight('#ffedce','#4b5260',1.25));
 const key=new THREE.DirectionalLight('#ffdfac',1.65);key.position.set(-3,5.5,3);scene.add(key);
 const rim=new THREE.DirectionalLight('#b6c5ca',.75);rim.position.set(3,4,-3);scene.add(rim);
 const gym=createArcadeGym();scene.add(gym.group);
 const rival=createArcadeRival();scene.add(rival.group);
 const materials:THREE.Material[]=[];
 const mat=(color:string)=>{const m=new THREE.MeshToonMaterial({color});materials.push(m);return m;};
 const blue=mat('#375567'),blueDark=mat('#253b4d'),cream=mat('#f0d9af'),skin=mat('#c98f69'),seam=mat('#203849');
 function ellipsoid(parent:THREE.Object3D,m:THREE.Material,size:[number,number,number],pos:[number,number,number]){const mesh=new THREE.Mesh(new THREE.SphereGeometry(1,20,14),m);mesh.scale.set(...size);mesh.position.set(...pos);parent.add(mesh);return mesh;}
 function segment(parent:THREE.Object3D,m:THREE.Material,r1:number,r2:number){const mesh=new THREE.Mesh(new THREE.CylinderGeometry(r1,r2,1,16),m);parent.add(mesh);return mesh;}
 function join(mesh:THREE.Mesh,a:THREE.Vector3,b:THREE.Vector3){const delta=new THREE.Vector3().subVectors(b,a);mesh.position.copy(a).add(b).multiplyScalar(.5);mesh.scale.y=delta.length();mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),delta.normalize());}
 const player=([-1,1] as const).map(side=>{
  const glove=new THREE.Group();glove.scale.setScalar(.82);scene.add(glove);
  ellipsoid(glove,blue,[.125,.145,.165],[0,.02,-.015]);
  ellipsoid(glove,blue,[.125,.09,.145],[0,.10,-.055]);
  ellipsoid(glove,blueDark,[.055,.088,.074],[-side*.092,-.005,.022]);
  const cuff=new THREE.Mesh(new THREE.CylinderGeometry(.092,.085,.105,18),cream);cuff.position.set(0,-.12,.055);cuff.rotation.x=.25;glove.add(cuff);
  const seamLine=new THREE.Mesh(new THREE.TorusGeometry(.083,.003,4,24),seam);seamLine.rotation.x=Math.PI/2;seamLine.position.set(0,-.075,.05);glove.add(seamLine);
  const forearm=segment(scene,skin,.067,.05),upper=segment(scene,skin,.10,.075);
  return {side,glove,forearm,upper};
 });
 const shadowMat=new THREE.MeshBasicMaterial({color:'#211e1b',transparent:true,opacity:.17,depthWrite:false});materials.push(shadowMat);
 // Layered inexpensive grounding shadows, no full-screen or dynamic shadow pass.
 const shadows=[1,.76,.5].map((scale,i)=>{const mesh=new THREE.Mesh(new THREE.CircleGeometry(.48,40),shadowMat.clone());materials.push(mesh.material);mesh.rotation.x=-Math.PI/2;mesh.scale.set(1.35*scale,.72*scale,1);mesh.position.y=.012+i*.001;scene.add(mesh);return mesh;});
 const flashMaterial=new THREE.LineBasicMaterial({color:'#fff0cd',transparent:true,opacity:0,depthWrite:false});materials.push(flashMaterial);
 const points:THREE.Vector3[]=[];for(let i=0;i<7;i++){const a=i*2*Math.PI/7;points.push(new THREE.Vector3(Math.cos(a)*.16,Math.sin(a)*.16,0),new THREE.Vector3(Math.cos(a)*.27,Math.sin(a)*.27,0));}
 const flash=new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(points),flashMaterial);scene.add(flash);
 let now=0,lastNow:number|null=null,visualDistance=2.75,disposed=false;
 const playerMotion=new ArcadePlayerMotion();let lastPunchType:'jab'|'cross'='jab';
 let reaction:{kind:'hit'|'block'|'incoming-block'|'incoming-hit';at:number}|null=null;
 let lastStatus:string|undefined,opening=0;const guardHeights={left:1,right:1};
 return {
  render(state:ArcadeSceneState,nowMs:number){
   if(disposed)return;now=Number.isFinite(nowMs)?nowMs:now;const dt=lastNow===null?16:Math.max(0,Math.min(100,now-lastNow));lastNow=now;
   if(state.roundStatus!==lastStatus){if(state.roundStatus==='running'&&lastStatus==='ready')opening=now;lastStatus=state.roundStatus;}
   const cinematic=finisherPose(state.phase,state.cinematicProgress,state.opponentHealth===0?state.result:null);
   const target=cinematic.active?2.05:1.48+THREE.MathUtils.clamp(state.distance,0,1)*1.48;visualDistance+=(target-visualDistance)*(1-Math.exp(-dt/120));rival.group.position.z=2.65-visualDistance;
   rival.update({opponentState:state.opponentState,phaseProgress:state.phaseProgress??0,opponentPunch:state.opponentPunch,roundStatus:state.roundStatus,phase:state.phase,cinematicProgress:state.cinematicProgress,result:state.phase==='RESULTS'&&state.opponentHealth>0?null:state.result},now);
   shadows.forEach(s=>{s.position.z=rival.group.position.z-cinematic.backward;s.scale.x=cinematic.knockout?1.35:1;});
   rim.intensity=cinematic.active?.95:.75;
   // Short restrained opening lens settle. No shake and no gameplay position changes.
   const intro=opening?Math.max(0,1-(now-opening)/800):0;camera.fov=48+intro*1.2;
   for(const arm of player){
    const hand=arm.side===-1?'left':'right';
    const observedGuard=state.handGuard?.[hand]??state.playerGuard??(state.guarding?'raised':'lowered');
    // Unknown tracking holds each hand's previous pose independently.
    if(observedGuard!=='unknown')guardHeights[hand]+=((observedGuard==='raised'?1:0)-guardHeights[hand])*(1-Math.exp(-dt/110));
    const guardHeight=guardHeights[hand];
    const extension=playerMotion.extension(hand,now);
    const restX=THREE.MathUtils.lerp(.40,.30,guardHeight),restY=THREE.MathUtils.lerp(1.12,1.43,guardHeight);
    const restZ=THREE.MathUtils.lerp(2.57,2.64,guardHeight);
    const wrist=new THREE.Vector3(arm.side*THREE.MathUtils.lerp(restX,.12,extension),THREE.MathUtils.lerp(restY,1.46,extension),THREE.MathUtils.lerp(restZ,1.85,extension));
    // In guard the elbows sit directly below the cuffs, rather than behind them.
    // The existing punch envelope unfolds the forearm forward from this bent pose.
    const elbow=new THREE.Vector3(arm.side*THREE.MathUtils.lerp(THREE.MathUtils.lerp(.49,.31,guardHeight),.37,extension),THREE.MathUtils.lerp(THREE.MathUtils.lerp(.80,.91,guardHeight),1.33,extension),THREE.MathUtils.lerp(THREE.MathUtils.lerp(3.08,2.70,guardHeight),2.71,extension));
    const shoulder=new THREE.Vector3(arm.side*.26,1.13,3.57);
    arm.glove.position.copy(wrist);arm.glove.rotation.set(extension*-.58,arm.side*.1-extension*arm.side*.15,-arm.side*(.12+extension*.05));
    const cuff=wrist.clone().add(new THREE.Vector3(0,-.095,.049));join(arm.forearm,cuff,elbow);join(arm.upper,elbow,shoulder);
   }
   const age=reaction?now-reaction.at:Infinity;flash.visible=age>=0&&age<160;flashMaterial.opacity=Math.max(0,1-age/160)*.8;
   flashMaterial.color.set(reaction?.kind==='block'||reaction?.kind==='incoming-block'?'#e6e2ce':'#fff0cd');
   flash.position.set(0,reaction?.kind.startsWith('incoming')?1.4:1.47,reaction?.kind.startsWith('incoming')?2.5:rival.group.position.z+.34);
   if(state.phase==='FINISHER_IMPACT'){flash.visible=true;flashMaterial.opacity=.8*cinematic.burst;flash.scale.setScalar(1.8);flash.position.set(0,1.47,rival.group.position.z+.34);}
   else flash.scale.setScalar(1);
   const w=Math.max(1,canvas.clientWidth),h=Math.max(1,canvas.clientHeight),ratio=renderer.getPixelRatio();if(canvas.width!==Math.floor(w*ratio)||canvas.height!==Math.floor(h*ratio)){renderer.setSize(w,h,false);camera.aspect=w/h;}
   camera.updateProjectionMatrix();renderer.render(scene,camera);
  },
  playerPunch(hand:'left'|'right',type:'jab'|'cross'){playerMotion.start(hand,type,now);lastPunchType=type;},
  impact(kind:'hit'|'block'|'incoming-block'|'incoming-hit'){reaction={kind,at:now};if(kind==='hit'||kind==='block')rival.hit(kind==='block'?'block':lastPunchType,now);},
  dispose(){if(disposed)return;disposed=true;rival.dispose();gym.dispose();scene.traverse(o=>{if(o instanceof THREE.Mesh||o instanceof THREE.Line)o.geometry.dispose();});materials.forEach(m=>m.dispose());renderer.dispose();}
 };
}
