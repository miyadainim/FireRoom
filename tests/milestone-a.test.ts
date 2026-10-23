import {describe,it,expect} from 'vitest';
import * as THREE from 'three';
import {buildGymEnvironment} from '../src/graphics/environment';
import {bagDisplacement,samplePromptReference} from '../src/graphics/scene';

// CPU geometry/behavior checks only. Rendered screenshots and timing remain separate gates.
describe('Milestone A independent environment acceptance',()=>{
 it('keeps the suspended target central and the ring outside its training corridor',()=>{
  const {environment,bag}=buildGymEnvironment();environment.updateMatrixWorld(true);
  const body=environment.getObjectByName('traditional-leather-heavy-bag')!;
  const bounds=new THREE.Box3().setFromObject(body),center=bounds.getCenter(new THREE.Vector3());
  expect(center.x).toBeCloseTo(0);expect(center.y).toBeCloseTo(1.6);expect(center.z).toBeCloseTo(-.3);
  expect(bounds.getSize(new THREE.Vector3()).y).toBeCloseTo(1.7);
  expect(bag.parent).toBe(environment);
  const ring=new THREE.Box3().setFromObject(environment.getObjectByName('background-boxing-ring')!);
  expect(ring.max.x).toBeLessThan(-1.5);
  expect(environment.getObjectByName('lockers-and-bench')).toBeDefined();
  expect(environment.getObjectByName('original-fireroom-gym-sign')).toBeDefined();
 });
 it('uses finite bounded static geometry and opaque lightweight materials without shadow passes',()=>{
  const {environment}=buildGymEnvironment();let triangles=0,meshes=0;
  environment.traverse(object=>{
   expect([...object.position,...object.scale,...object.quaternion].every(Number.isFinite)).toBe(true);
   if(!(object instanceof THREE.Mesh))return;
   meshes++;expect(object.castShadow).toBe(false);expect(object.receiveShadow).toBe(false);
   const geometry=object.geometry;triangles+=(geometry.index?.count??geometry.attributes.position.count)/3*(object instanceof THREE.InstancedMesh?object.count:1);
   const materials=Array.isArray(object.material)?object.material:[object.material];
   for(const material of materials){expect(material instanceof THREE.MeshToonMaterial||material instanceof THREE.MeshBasicMaterial).toBe(true);expect(material.transparent).toBe(false);expect(material.opacity).toBe(1);expect((material as THREE.MeshToonMaterial).map).toBeNull();}
  });
  expect(meshes).toBeLessThan(180);expect(triangles).toBeLessThan(20000);
 });
 it('keeps jab, cross and combination guides anatomical with finite bounded virtual bag motion',()=>{
  for(const stance of ['orthodox','southpaw'] as const){
   const lead=stance==='orthodox'?'left':'right',rear=lead==='left'?'right':'left';
   expect(samplePromptReference(499,'jab',stance).hand).toBe(lead);
   expect(samplePromptReference(499,'cross',stance).hand).toBe(rear);
   expect(samplePromptReference(1499,'jab-cross',stance).hand).toBe(rear);
  }
  const {environment,bag}=buildGymEnvironment();
  for(let t=0;t<=10000;t+=40){bag.rotation.x=bagDisplacement(t,100);environment.updateMatrixWorld(true);expect(Math.abs(bag.rotation.x)).toBeLessThanOrEqual(.24);expect(new THREE.Box3().setFromObject(bag).isEmpty()).toBe(false);}
  expect(Math.abs(bagDisplacement(10000,100))).toBeLessThan(.00001);
 });
});
