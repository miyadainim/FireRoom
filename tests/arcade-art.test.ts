import {describe,it,expect} from 'vitest';
import * as THREE from 'three';
import {createArcadeRival,type RivalVisualState} from '../src/graphics/arcade-rival';
import {createArcadeGym} from '../src/graphics/arcade-gym';

const pose=(opponentState:string,phaseProgress=0,extra:Partial<RivalVisualState>={}):RivalVisualState=>({opponentState,phaseProgress,opponentPunch:'jab',roundStatus:'running',...extra});
function node(root:THREE.Object3D,name:string){const found=root.getObjectByName(name);expect(found,`Missing articulated anchor ${name}`).toBeDefined();return found!;}
function position(root:THREE.Object3D,name:string){root.updateMatrixWorld(true);return node(root,name).getWorldPosition(new THREE.Vector3());}

describe('Arcade authored presentation geometry',()=>{
 it('keeps human-scale finite bounds in every combat state and both punch reactions',()=>{
  const rival=createArcadeRival();
  try{
   for(const state of ['APPROACH','GUARD','ATTACK_WINDUP','ATTACK','RECOVERY','HIT_REACTION','RETREAT'])for(const progress of [0,.25,.65,.999]){
    rival.update(pose(state,progress),1000+progress*500);rival.group.updateMatrixWorld(true);
    rival.group.traverse(o=>expect(o.matrixWorld.elements.every(Number.isFinite),`${state}: ${o.name}`).toBe(true));
    const box=new THREE.Box3().setFromObject(rival.group);expect(box.max.y,`${state}: maximum head/glove height`).toBeLessThan(2.05);expect(box.max.x-box.min.x).toBeLessThan(1.25);expect(box.min.y).toBeGreaterThan(-.035);
   }
   for(const kind of ['jab','cross','block'] as const){rival.hit(kind,2000);rival.update(pose('HIT_REACTION',.2),2050);const box=new THREE.Box3().setFromObject(rival.group);expect(box.max.y).toBeLessThan(2.05);expect(box.max.y-box.min.y).toBeGreaterThan(1.5);}
   for(const result of ['win','loss','draw'] as const){rival.update(pose('GUARD',1,{roundStatus:'complete',result}),3000);const box=new THREE.Box3().setFromObject(rival.group);expect(box.max.y).toBeLessThan(2.05);expect(box.min.y,`${result}: shoes stay on canvas`).toBeGreaterThan(-.035);}
  }finally{rival.dispose();}
 });
 it('keeps articulated upper arms and forearms joined to elbows and glove wrists',()=>{
  const rival=createArcadeRival();
  try{for(const state of ['GUARD','ATTACK_WINDUP','ATTACK','RECOVERY','HIT_REACTION','RETREAT'])for(const progress of [0,.5,1]){
   rival.update(pose(state,progress),1000+progress*400);rival.group.updateMatrixWorld(true);
   for(const side of ['left','right']){
    const fore=node(rival.group,`${side}-forearm`),upper=node(rival.group,`${side}-upper-arm`),elbow=position(rival.group,`${side}-elbow`),wrist=position(rival.group,`${side}-glove`);
    expect(fore.localToWorld(new THREE.Vector3(0,-.5,0)).distanceTo(elbow)).toBeLessThan(.00001);
    expect(fore.localToWorld(new THREE.Vector3(0,.5,0)).distanceTo(wrist)).toBeLessThan(.00001);
    expect(upper.localToWorld(new THREE.Vector3(0,.5,0)).distanceTo(elbow)).toBeLessThan(.00001);
   }
  }}finally{rival.dispose();}
 });
 it('distinguishes guard, telegraph and extended attack without inventing a punch after being hit',()=>{
  const rival=createArcadeRival();
  try{
   rival.update(pose('GUARD'),0);const guard=position(rival.group,'left-glove');
   rival.update(pose('ATTACK_WINDUP',1),100);const windup=position(rival.group,'left-glove');expect(windup.distanceTo(guard)).toBeGreaterThan(.025);
   rival.update(pose('ATTACK',1),200);const attack=position(rival.group,'left-glove');expect(attack.z-guard.z).toBeGreaterThan(.3);
   rival.update(pose('HIT_REACTION',.9),1000);const hitGuard=position(rival.group,'left-glove');
   rival.update(pose('RECOVERY',0),1016);const recovery=position(rival.group,'left-glove');expect(recovery.z-hitGuard.z,'being hit must not create an unearned extended strike').toBeLessThan(.08);
  }finally{rival.dispose();}
 });
 it('tapers athletic upper arms toward elbows and forearms toward wrists',()=>{
  const rival=createArcadeRival();try{for(const side of ['left','right']){
   const upper=node(rival.group,`${side}-upper-arm`) as THREE.Mesh<THREE.CylinderGeometry>;
   const fore=node(rival.group,`${side}-forearm`) as THREE.Mesh<THREE.CylinderGeometry>;
   // Each authored segment runs from local -Y (proximal) to +Y (distal).
   expect(upper.geometry.parameters.radiusBottom).toBeGreaterThan(upper.geometry.parameters.radiusTop);
   expect(fore.geometry.parameters.radiusBottom).toBeGreaterThan(fore.geometry.parameters.radiusTop);
  }}finally{rival.dispose();}
 });
 it('constructs a bounded static gym without DOM/WebGL and releases its resources',()=>{
  const gym=createArcadeGym();let meshes=0;const geometries=new Set<THREE.BufferGeometry>(),materials=new Set<THREE.Material>();
  gym.group.traverse(o=>{if(o instanceof THREE.Mesh){meshes++;geometries.add(o.geometry);for(const m of Array.isArray(o.material)?o.material:[o.material])materials.add(m);}});
  expect(meshes).toBeLessThan(130);expect(gym.group.getObjectByName('aged-training-ring-canvas')).toBeDefined();
  let disposedGeometry=0,disposedMaterial=0;geometries.forEach(g=>g.addEventListener('dispose',()=>disposedGeometry++));materials.forEach(m=>m.addEventListener('dispose',()=>disposedMaterial++));gym.dispose();expect(disposedGeometry).toBe(geometries.size);expect(disposedMaterial).toBe(materials.size);
 });
});
