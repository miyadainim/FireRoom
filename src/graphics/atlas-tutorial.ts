import * as THREE from 'three';
import {ATLAS_PLACEMENT} from './atlas';
import tutorialImage from './assets/atlas-tutorial.png';
/** Two transparent, pre-authored illustrated poses. No skeleton or CV calibration. */
export function createTutorialAtlas(){
 const group=new THREE.Group();group.name='atlas-beginner-poses';group.position.set(ATLAS_PLACEMENT.x,0,ATLAS_PLACEMENT.z);group.rotation.y=ATLAS_PLACEMENT.yaw;group.visible=false;
 const geometry=new THREE.PlaneGeometry(1.39,1.85);geometry.translate(0,.925,0);
 const material=new THREE.MeshBasicMaterial({transparent:true,alphaTest:.08,depthWrite:true,toneMapped:false});
 const mesh=new THREE.Mesh(geometry,material);mesh.visible=false;group.add(mesh);
 const texture=new THREE.TextureLoader().load(tutorialImage,()=>{mesh.visible=true;});
 texture.colorSpace=THREE.SRGBColorSpace;texture.generateMipmaps=false;texture.minFilter=texture.magFilter=THREE.LinearFilter;texture.repeat.set(.5,1);material.map=texture;
 return {group,approve(value:boolean){texture.offset.x=value?.5:0;},dispose(){texture.dispose();}};
}
