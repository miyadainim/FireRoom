import * as THREE from 'three';

export const COACH_STATES = ['idle','speaking','instructing','encouraging'] as const;
export type CoachVisualState = typeof COACH_STATES[number];
/** Grounded at floor level, with a fixed orientation toward the initial player position. */
export const ATLAS_PLACEMENT = {x:1.95,z:-.4,height:1.85,width:0.925,yaw:Math.atan2(-1.95,3.25)} as const;
export interface CoachAnimationSample {cell:0|1|2;offsetU:number;scaleY:number;rotationZ:number}
/** Presentation motion only: no lip synchronization, tracking, or technique inference. */
export function sampleCoachAnimation(elapsedMs:number,state:CoachVisualState):CoachAnimationSample {
 if(!COACH_STATES.includes(state))throw new Error('Unsupported coach visual state');
 const t=Math.max(0,Number.isFinite(elapsedMs)?elapsedMs:0)/1000;
 const cell=state==='instructing'?1:state==='encouraging'?2:0;
 const breathing=Math.sin(t*Math.PI*2/4.2)*.003;
 const gesture=state==='speaking'?Math.sin(t*3.4)*.004:state==='encouraging'?Math.sin(t*4)*.005:state==='instructing'?Math.sin(t*2)*.002:0;
 return {cell,offsetU:cell/3,scaleY:1+breathing,rotationZ:gesture};
}

/** Single alpha-tested illustrated plane; its orientation never follows the camera. */
export function createCoachAtlas(imageUrl:string,loader:Pick<THREE.TextureLoader,'load'>=new THREE.TextureLoader()) {
 const group=new THREE.Group();group.name='coach-atlas';group.position.set(ATLAS_PLACEMENT.x,0,ATLAS_PLACEMENT.z);group.rotation.y=ATLAS_PLACEMENT.yaw;
 // Translate the plane so breathing stays anchored to the gym floor.
 const geometry=new THREE.PlaneGeometry(ATLAS_PLACEMENT.width,ATLAS_PLACEMENT.height);geometry.translate(0,ATLAS_PLACEMENT.height/2,0);
 const material=new THREE.MeshBasicMaterial({transparent:true,alphaTest:.08,depthTest:true,depthWrite:true,toneMapped:false});
 const illustration=new THREE.Mesh(geometry,material);illustration.name='original-illustrated-veteran-coach';illustration.visible=false;group.add(illustration);
 let disposed=false,texture:THREE.Texture|null=null,state:CoachVisualState='idle',startedAt:number|null=null;
 loader.load(imageUrl,loaded=>{
  if(disposed){loaded.dispose();return;}
  texture=loaded;texture.colorSpace=THREE.SRGBColorSpace;texture.wrapS=texture.wrapT=THREE.ClampToEdgeWrapping;
  // Preserve ink detail when the illustrated coach is minified in the scene.
  // A single source sheet needs no mip chain; trilinear mip blending softened the face.
  texture.generateMipmaps=false;texture.minFilter=THREE.LinearFilter;texture.magFilter=THREE.LinearFilter;
  texture.repeat.set(1/3,1);texture.offset.x=sampleCoachAnimation(0,state).offsetU;
  material.map=texture;material.needsUpdate=true;illustration.visible=true;
 },undefined,()=>{illustration.visible=false;});
 return {
  group,
  setState(next:CoachVisualState){if(!COACH_STATES.includes(next))throw new Error('Unsupported coach visual state');if(next!==state){state=next;startedAt=null;}},
  update(nowMs:number){if(disposed)return;if(startedAt===null)startedAt=nowMs;const sample=sampleCoachAnimation(nowMs-startedAt,state);illustration.scale.y=sample.scaleY;illustration.rotation.z=sample.rotationZ;if(texture)texture.offset.x=sample.offsetU;},
  // Scene owns geometry/material traversal. Texture ownership is explicit because Three.js does not dispose maps with materials.
  dispose(){if(disposed)return;disposed=true;texture?.dispose();}
 };
}
