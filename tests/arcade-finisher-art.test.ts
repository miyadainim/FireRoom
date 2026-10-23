import {describe,it,expect} from 'vitest';
import * as THREE from 'three';
import {createArcadeRival} from '../src/graphics/arcade-rival';
import {finisherPose} from '../src/graphics/arcade-finisher';
import type {CombatPhase} from '../src/game/arcade-combat-contracts';
describe('Milestone B authored finisher geometry',()=>{
 it('is deterministic, bounded and keeps the whole rival above the canvas throughout the knockout',()=>{
  const rival=createArcadeRival();rival.group.position.z=.60;
  try{
   for(const phase of ['FINISHER_INTRO','FINISHER_READY','FINISHER_IMPACT','KNOCKOUT_ANIMATION','RESULTS'] as CombatPhase[]){
    const steps=phase==='KNOCKOUT_ANIMATION'?100:2;for(let i=0;i<=steps;i++){
     const progress=i/steps;rival.update({opponentState:phase==='KNOCKOUT_ANIMATION'?'KNOCKOUT':'STUNNED',phaseProgress:0,phase,cinematicProgress:progress,result:phase==='RESULTS'?'win':null,roundStatus:phase==='RESULTS'?'complete':'running'},2000+progress*1800);
     rival.group.updateMatrixWorld(true);rival.group.traverse(o=>expect(o.matrixWorld.elements.every(Number.isFinite),`${phase}@${progress} ${o.name}`).toBe(true));
     const box=new THREE.Box3().setFromObject(rival.group);
     expect(box.min.y,`${phase}@${progress}: no floor penetration`).toBeGreaterThanOrEqual(-.035);
     expect(box.max.y,`${phase}@${progress}: bounded authored flight`).toBeLessThan(2.5);
     expect(Math.max(Math.abs(box.min.x),Math.abs(box.max.x)),`${phase}: side ropes`).toBeLessThan(2.5);
     expect(Math.max(Math.abs(box.min.z),Math.abs(box.max.z)),`${phase}: end ropes`).toBeLessThan(3.2);
    }
   }
  }finally{rival.dispose();}
 });
 it('clamps finite progress and preserves a final victory pose while nonwins stay upright',()=>{
  expect(finisherPose('KNOCKOUT_ANIMATION',-1)).toEqual(finisherPose('KNOCKOUT_ANIMATION',0));
  expect(finisherPose('KNOCKOUT_ANIMATION',2)).toEqual(finisherPose('KNOCKOUT_ANIMATION',1));
  expect(finisherPose('RESULTS',0,'win')).toMatchObject({knockout:true,backward:1.35,tilt:-Math.PI/2,fall:1});
  for(const result of ['loss','draw'])expect(finisherPose('RESULTS',1,result)).toMatchObject({knockout:false,active:false,backward:0,tilt:0});
  expect(finisherPose('FINISHER_READY',.5)).toMatchObject({stun:true,knockout:false,backward:0});
 });
});
