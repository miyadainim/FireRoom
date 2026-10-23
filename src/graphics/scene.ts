import {sampleVirtualBagReaction} from './bag-impact';
import * as THREE from 'three';
import { buildGymEnvironment } from './environment';
import { createCoachAtlas, type CoachVisualState } from './atlas';
import atlasImage from './assets/atlas-image';
import {createGhostArm,sampleGhostOpacity} from './ghost-arms';
import {sampleGuardReference,GUARD_REFERENCE_DURATION_MS} from './tutorial';
import {createTutorialAtlas} from './atlas-tutorial';
import type {AtlasTutorialShot} from '../game/atlas-tutorial';

export type Drill = 'jab' | 'jab-cross';
export type PlaybackSpeed = 0.25 | 0.5 | 1;
export type PromptExercise = 'jab' | 'cross' | 'jab-cross';
export type PromptStance = 'orthodox' | 'southpaw';
export interface AnimationSample { timestampMs:number; phase:'guard'|'extension'|'recovery'|'complete'; hand:'left'|'right'|null; leftExtension:number; rightExtension:number }
export const REFERENCE_DURATION_MS = {jab:1000,'jab-cross':2000} as const;
/** Preauthored visual guide, orthodox stance. No player-body calibration or measured impact. */
export function sampleReference(elapsedMs:number, drill:Drill):AnimationSample {
 const timestampMs=Math.max(0,Number.isFinite(elapsedMs)?elapsedMs:0);
 if(timestampMs>=REFERENCE_DURATION_MS[drill])return {timestampMs,phase:'complete',hand:null,leftExtension:0,rightExtension:0};
 const hand=timestampMs<1000?'left':'right';
 const local=timestampMs%1000;
 const phase=local<200?'guard':local<500?'extension':local<850?'recovery':'guard';
 const t=phase==='extension'?(local-200)/300:phase==='recovery'?1-(local-500)/350:0;
 const extension=t*t*(3-2*t);
 return {timestampMs,phase,hand,leftExtension:hand==='left'?extension:0,rightExtension:hand==='right'?extension:0};
}
/** Single prescribed punch; stance changes anatomical hand, never preview mirroring. */
export function samplePromptReference(elapsedMs:number,exercise:PromptExercise,stance:PromptStance):AnimationSample {
 const sample=sampleReference(elapsedMs,exercise==='jab-cross'?'jab-cross':'jab');
 if(sample.phase==='complete')return sample;
 const isJab=exercise==='jab-cross'?sample.hand==='left':exercise==='jab';
 const hand=isJab===(stance==='orthodox')?'left':'right';
 const extension=Math.max(sample.leftExtension,sample.rightExtension);
 return {...sample,hand,leftExtension:hand==='left'?extension:0,rightExtension:hand==='right'?extension:0};
}
export function bagDisplacement(elapsedMs:number,score:number):number {
 if(!Number.isFinite(elapsedMs)||elapsedMs<0||!Number.isFinite(score))return 0;
 return Math.sin(elapsedMs/170)*Math.exp(-elapsedMs/650)*Math.max(0,Math.min(100,score))/100*0.24;
}
export function createScene(canvas:HTMLCanvasElement) {
 const renderer=new THREE.WebGLRenderer({canvas,antialias:false,alpha:false,powerPreference:'low-power'});
 renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.5));
 const scene=new THREE.Scene();scene.background=new THREE.Color('#c9af78');scene.fog=new THREE.Fog('#c9af78',5,17);
 const camera=new THREE.PerspectiveCamera(52,1,0.1,30);camera.position.set(0,1.65,2.85);camera.lookAt(0,1.25,0);
 scene.add(new THREE.HemisphereLight(0xffedc6,0x665447,2.2));
 const light=new THREE.DirectionalLight(0xffe6af,2);light.position.set(-3,5,3);scene.add(light);
 const {environment,bag}=buildGymEnvironment();scene.add(environment);
 // Fixed stylized glints around the virtual target, not measured contact coordinates.
 const glintPoints:THREE.Vector3[]=[];for(const x of [-1,1])for(const y of [-1,1])glintPoints.push(new THREE.Vector3(x*.43,-1.1+y*.17,.44),new THREE.Vector3(x*.58,-1.1+y*.3,.44));
 const glintMaterial=new THREE.LineBasicMaterial({color:0xfff4d7,transparent:true,opacity:0,depthWrite:false});
 const impactGlints=new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(glintPoints),glintMaterial);impactGlints.visible=false;bag.add(impactGlints);
 const atlas=createCoachAtlas(atlasImage);scene.add(atlas.group);
 const tutorialAtlas=createTutorialAtlas();scene.add(tutorialAtlas.group);
 let tutorialShot:AtlasTutorialShot=null;
 const focusTarget=new THREE.Vector3(0,1.25,0);
 const arms=([-1,1] as const).map(side=>{
  const arm=createGhostArm(side);
  arm.group.position.set(side*.32,1.35,1.65);scene.add(arm.group);return arm;
 });
 const bagRestZ=bag.position.z;let virtualHit:{at:number;type:'jab'|'cross'}|null=null;
 let drill:Drill='jab-cross',speed:PlaybackSpeed=1,elapsed:number=REFERENCE_DURATION_MS['jab-cross'],lastNow:number|null=null,hitAt:number|null=null,hitScore=0,disposed=false;
 let prompt:{exercise:PromptExercise;stance:PromptStance}|null=null;
 let guardStance:PromptStance|null=null;
 let instructionRemainingMs=0;
 return {
  update(nowMs:number){
   if(disposed)return;
   const dt=lastNow===null?0:Math.max(0,nowMs-lastNow);lastNow=nowMs;elapsed+=dt*speed;
   if(instructionRemainingMs>0){instructionRemainingMs=Math.max(0,instructionRemainingMs-dt);if(instructionRemainingMs===0)atlas.setState('idle');}
   atlas.update(nowMs);
   const targetPosition=tutorialShot==='legs'?new THREE.Vector3(1.95,.65,1.5):tutorialShot==='guard'?new THREE.Vector3(1.95,1.5,1.1):tutorialShot?new THREE.Vector3(1.95,1.12,2.5):new THREE.Vector3(0,1.65,2.85);
   const targetLook=tutorialShot==='legs'?new THREE.Vector3(1.95,.42,-.4):tutorialShot==='guard'?new THREE.Vector3(1.95,1.4,-.4):tutorialShot?new THREE.Vector3(1.95,.95,-.4):new THREE.Vector3(0,1.25,0);
   const blend=window.matchMedia?.('(prefers-reduced-motion: reduce)').matches?1:1-Math.exp(-dt/240);camera.position.lerp(targetPosition,blend);focusTarget.lerp(targetLook,blend);camera.lookAt(focusTarget);
   const targetFov=tutorialShot?44:52;if(Math.abs(camera.fov-targetFov)>.01){camera.fov+=(targetFov-camera.fov)*blend;camera.updateProjectionMatrix();}
   const sample=prompt?samplePromptReference(elapsed,prompt.exercise,prompt.stance):sampleReference(elapsed,drill);
   const duration=guardStance?GUARD_REFERENCE_DURATION_MS:REFERENCE_DURATION_MS[prompt?(prompt.exercise==='jab-cross'?'jab-cross':'jab'):drill];
   const opacity=tutorialShot?0:sampleGhostOpacity(elapsed,duration);
   const guard=guardStance?sampleGuardReference(elapsed):null;
   arms.forEach((arm,i)=>{arm.setGuardPose(!!guard);const e=guard?0:i===0?sample.leftExtension:sample.rightExtension;arm.group.position.z=1.65-e*1.45;arm.group.position.x=(i===0?-1:1)*(.32-.16*e);arm.group.position.y=1.35+.12*e-(guard?.loweringOffset??0);arm.setOpacity(opacity);});
   const glintAge=virtualHit?nowMs-virtualHit.at:Infinity;impactGlints.visible=glintAge>=0&&glintAge<180;glintMaterial.opacity=Math.max(0,1-glintAge/180)*.9;
   if(virtualHit){const response=sampleVirtualBagReaction(nowMs-virtualHit.at,virtualHit.type);bag.rotation.x=response.rotationX;bag.position.z=bagRestZ+response.backwardOffset;}else{bag.rotation.x=hitAt===null?0:bagDisplacement(nowMs-hitAt,hitScore);bag.position.z=bagRestZ;}
   const width=Math.max(1,canvas.clientWidth),height=Math.max(1,canvas.clientHeight);
   const pixelRatio=renderer.getPixelRatio();if(canvas.width!==Math.floor(width*pixelRatio)||canvas.height!==Math.floor(height*pixelRatio)){renderer.setSize(width,height,false);camera.aspect=width/height;camera.updateProjectionMatrix();}
   renderer.render(scene,camera);
  },
  replay(next:Drill){drill=next;prompt=null;guardStance=null;elapsed=0;lastNow=null;instructionRemainingMs=REFERENCE_DURATION_MS[next]/speed;atlas.setState('instructing');},
  replayPrompt(exercise:PromptExercise,stance:PromptStance){prompt={exercise,stance};guardStance=null;elapsed=0;lastNow=null;instructionRemainingMs=REFERENCE_DURATION_MS[exercise==='jab-cross'?'jab-cross':'jab']/speed;atlas.setState('instructing');},
  demonstrateGuard(stance:PromptStance){guardStance=stance;prompt=null;elapsed=0;lastNow=null;instructionRemainingMs=GUARD_REFERENCE_DURATION_MS/speed;atlas.setState('instructing');},
  cancelDemonstration(){prompt=null;guardStance=null;elapsed=10000;instructionRemainingMs=0;lastNow=null;atlas.setState('idle');},
  setTutorialShot(shot:AtlasTutorialShot){tutorialShot=shot;tutorialAtlas.group.visible=shot!==null;atlas.group.visible=shot===null;tutorialAtlas.approve(shot==='approval');},
  setCoachState(next:CoachVisualState){instructionRemainingMs=next==='speaking'?4000:next==='encouraging'?2000:next==='instructing'?REFERENCE_DURATION_MS[drill]/speed:0;atlas.setState(next);},
  setSpeed(next:PlaybackSpeed){if(![.25,.5,1].includes(next))throw new Error('Unsupported playback speed');speed=next;},
  punchImpact(type:'jab'|'cross'){virtualHit={at:performance.now(),type};},
  hit(score:number){virtualHit=null;hitScore=score;hitAt=lastNow;},
  dispose(){disposed=true;atlas.dispose();tutorialAtlas.dispose();scene.traverse(object=>{if(object instanceof THREE.Mesh||object instanceof THREE.Line){object.geometry.dispose();const materials=Array.isArray(object.material)?object.material:[object.material];materials.forEach(material=>material.dispose());}});renderer.dispose();}
 };
}
