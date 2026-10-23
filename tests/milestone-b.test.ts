import {describe,it,expect,vi} from 'vitest';
import * as THREE from 'three';
import {COACH_STATES,ATLAS_PLACEMENT,createCoachAtlas,sampleCoachAnimation} from '../src/graphics/atlas';
import {buildGymEnvironment} from '../src/graphics/environment';

// CPU contract/geometry checks; actual rendered visibility remains a separate gate.
describe('Milestone B independent illustrated coach acceptance',()=>{
 it('samples every presentation state deterministically with bounded subtle motion',()=>{
  for(const state of COACH_STATES)for(const t of [-1,0,100,900,4200,20000,NaN,Infinity]){
   const sample=sampleCoachAnimation(t,state);
   expect(sample).toEqual(sampleCoachAnimation(t,state));
   expect(Object.values(sample).every(Number.isFinite)).toBe(true);
   expect(Math.abs(sample.scaleY-1)).toBeLessThanOrEqual(.003000001);
   expect(Math.abs(sample.rotationZ)).toBeLessThanOrEqual(.005000001);
   expect(sample.offsetU).toBe(sample.cell/3);
   expect(sample.cell).toBe(state==='instructing'?1:state==='encouraging'?2:0);
  }
  expect(()=>sampleCoachAnimation(0,'invalid' as never)).toThrow();
 });
 it('uses one floor-anchored plane and selects only the requested illustration cell',()=>{
  const texture=new THREE.Texture();
  const atlas=createCoachAtlas('test://original', {load:(_url,onLoad)=>{onLoad?.(texture);return texture;}});
  const mesh=atlas.group.children[0] as THREE.Mesh<THREE.PlaneGeometry,THREE.MeshBasicMaterial>;
  expect(atlas.group.children).toHaveLength(1);expect(mesh.geometry.index!.count).toBe(6);
  mesh.geometry.computeBoundingBox();expect(mesh.geometry.boundingBox!.min.y).toBeCloseTo(0,6);
  expect(mesh.material.map).toBe(texture);expect(texture.repeat.x).toBeCloseTo(1/3);
  expect(mesh.material.alphaTest).toBeGreaterThan(0);expect(mesh.material.depthTest).toBe(true);
  expect(mesh.visible).toBe(true);expect(texture.colorSpace).toBe(THREE.SRGBColorSpace);
  for(const [state,cell] of [['idle',0],['speaking',0],['instructing',1],['encouraging',2]] as const){
   atlas.setState(state);atlas.update(1000);atlas.update(1100);
   expect(texture.offset.x).toBeCloseTo(cell/3);
   expect(texture.offset.x+texture.repeat.x).toBeLessThanOrEqual(1);
  }
  expect(()=>atlas.setState('invalid' as never)).toThrow();
  const disposal=vi.spyOn(texture,'dispose');atlas.dispose();atlas.dispose();expect(disposal).toHaveBeenCalledTimes(1);
 });
 it('disposes a delayed asset and never reveals a failed or disposed load',()=>{
  let loaded:((texture:THREE.Texture)=>void)|undefined;
  const texture=new THREE.Texture(),disposal=vi.spyOn(texture,'dispose');
  const atlas=createCoachAtlas('test://delayed',{load:(_url,onLoad)=>{loaded=onLoad;return texture;}});
  expect(atlas.group.children[0].visible).toBe(false);atlas.dispose();loaded!(texture);
  expect(disposal).toHaveBeenCalledTimes(1);expect(atlas.group.children[0].visible).toBe(false);
 });
 it('stays beside the bag and outside the ghost-arm corridor in the current camera',()=>{
  const texture=new THREE.Texture();const atlas=createCoachAtlas('test://bounds',{load:(_url,onLoad)=>{onLoad?.(texture);return texture;}});
  const {environment}=buildGymEnvironment();environment.updateMatrixWorld(true);
  const bag=new THREE.Box3().setFromObject(environment.getObjectByName('traditional-leather-heavy-bag')!);
  const camera=new THREE.PerspectiveCamera(52,16/9,.1,30);camera.position.set(0,1.65,2.85);camera.lookAt(0,1.25,0);camera.updateMatrixWorld(true);
  const projected=(box:THREE.Box3)=>{const points=[];for(const x of [box.min.x,box.max.x])for(const y of [box.min.y,box.max.y])for(const z of [box.min.z,box.max.z])points.push(new THREE.Vector3(x,y,z).project(camera));return new THREE.Box3().setFromPoints(points);};
  for(const state of COACH_STATES)for(const t of [0,500,1000,2000]){
   atlas.setState(state);atlas.update(0);atlas.update(t);atlas.group.updateMatrixWorld(true);
   const bounds=new THREE.Box3().setFromObject(atlas.group);
   expect(bounds.min.x).toBeGreaterThan(.9);expect(bounds.min.y).toBeCloseTo(0,2);
   for(const aspect of [16/9,4.2]){camera.aspect=aspect;camera.updateProjectionMatrix();const mesh=atlas.group.children[0] as THREE.Mesh;
    const vertices=mesh.geometry.getAttribute('position');const points=[];
    for(let i=0;i<vertices.count;i++)points.push(new THREE.Vector3().fromBufferAttribute(vertices,i).applyMatrix4(mesh.matrixWorld).project(camera));
    const coach=new THREE.Box3().setFromPoints(points),target=projected(bag);
    expect(coach.min.x).toBeGreaterThan(target.max.x);expect(coach.max.x).toBeLessThan(1);
    expect(coach.min.y).toBeGreaterThan(-1);expect(coach.max.y).toBeLessThan(1);
    // World-space clearance; actual alpha silhouette vs foreground ghosts is reviewed in screenshots.
    expect(bounds.min.x).toBeGreaterThan(.5);
   }
  }
  expect(atlas.group.rotation.y).toBe(ATLAS_PLACEMENT.yaw);
 });
});

describe('Milestone B read-only lesson presentation adapter',()=>{
 it('subscribes to existing dialogue and explicit completed-step availability without changing controls',async()=>{
  const {attachAtlasPresentation}=await import('../src/graphics/atlas-presentation');
  const observers:{callback:()=>void;disconnect:ReturnType<typeof vi.fn>}[]=[];
  vi.stubGlobal('MutationObserver',class{
   disconnect=vi.fn();constructor(callback:()=>void){observers.push({callback,disconnect:this.disconnect});}observe(){}
  });
  try{
   const dialogue={textContent:''};const next={disabled:true,hidden:false};const states:string[]=[];
   const root={querySelector:(selector:string)=>selector==='#atlas'?dialogue:next} as unknown as HTMLElement;
   const detach=attachAtlasPresentation(root,state=>states.push(state));
   observers[0].callback();observers[1].callback();expect(states).toEqual([]);
   dialogue.textContent='Keep movements controlled.';observers[0].callback();expect(states).toEqual(['speaking']);
   next.disabled=false;next.hidden=true;observers[1].callback();expect(states).toHaveLength(1);
   next.hidden=false;observers[1].callback();expect(states).toEqual(['speaking','encouraging']);
   expect(next).toEqual({disabled:false,hidden:false});detach();
   for(const observer of observers)expect(observer.disconnect).toHaveBeenCalledTimes(1);
  }finally{vi.unstubAllGlobals();}
 });
});
