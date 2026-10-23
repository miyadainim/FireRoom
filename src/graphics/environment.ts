import * as THREE from 'three';

/** Static, texture-free gym geometry; construction does not require a DOM or WebGL. */
export function buildGymEnvironment() {
 const environment=new THREE.Group();environment.name='anime-boxing-gym';
 const palette={wall:0xd5b765,cream:0xf0dfb0,blue:0x3d6475,navy:0x273c49,red:0x983c35,wood:0x886447,metal:0x535956,dark:0x302d2a};
 const materials=Object.fromEntries(Object.entries(palette).map(([key,color])=>[key,new THREE.MeshToonMaterial({color})])) as Record<keyof typeof palette,THREE.MeshToonMaterial>;
 function box(parent:THREE.Group,name:string,size:number[],position:number[],material:THREE.Material) {
  const mesh=new THREE.Mesh(new THREE.BoxGeometry(...size as [number,number,number]),material);mesh.name=name;mesh.position.set(...position as [number,number,number]);parent.add(mesh);return mesh;
 }
 function rod(parent:THREE.Group,name:string,a:THREE.Vector3,b:THREE.Vector3,radius:number,material:THREE.Material) {
  const delta=b.clone().sub(a);const mesh=new THREE.Mesh(new THREE.CylinderGeometry(radius,radius,delta.length(),8),material);mesh.name=name;mesh.position.copy(a).add(b).multiplyScalar(.5);mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),delta.normalize());parent.add(mesh);return mesh;
 }
 box(environment,'wood-floor',[16,.12,16],[0,-.07,-2],materials.wood);
 // Thin plank divisions suggest wear without textures or transparent overlays.
 for(let x=-8;x<=8;x+=1)box(environment,'floor-plank-joint',[.012,.006,16],[x,-.005,-2],materials.wood);
 box(environment,'back-yellow-wall',[16,5,.15],[0,2.5,-7],materials.wall);
 box(environment,'left-yellow-wall',[.15,5,16],[-8,2.5,-2],materials.wall);
 box(environment,'right-yellow-wall',[.15,5,16],[8,2.5,-2],materials.wall);
 box(environment,'ceiling',[16,.1,16],[0,5,-2],materials.cream);
 box(environment,'back-wall-blue-wainscot',[16,1,.08],[0,.5,-6.89],materials.blue);
 box(environment,'back-wall-wood-trim',[16,.065,.12],[0,1.04,-6.83],materials.wood);
 for(const x of [-7.89,7.89]){
  box(environment,'side-wall-blue-wainscot',[.08,1,16],[x,.5,-2],materials.blue);
  box(environment,'side-wall-wood-trim',[.12,.065,16],[x,1.04,-2],materials.wood);
 }
 // A high rear window provides a quiet cool accent beside the equipment.
 box(environment,'rear-window-frame',[1.35,1.55,.1],[6.45,3.2,-6.85],materials.wood);
 const glass=new THREE.MeshBasicMaterial({color:0xaac1b6});
 box(environment,'rear-window-daylight',[1.19,1.39,.03],[6.45,3.2,-6.78],glass);
 box(environment,'window-center-mullion',[.045,1.4,.04],[6.45,3.2,-6.75],materials.cream);
 box(environment,'window-cross-mullion',[1.2,.045,.04],[6.45,3.2,-6.75],materials.cream);
 box(environment,'training-mat',[4,.045,4.5],[.35,.005,.1],materials.blue);
 for(const x of [-1.65,2.35])box(environment,'mat-edge',[.035,.008,4.5],[x,.032,.1],materials.cream);
 for(const x of [-5,0,5]){
  box(environment,'ceiling-beam',[.14,.25,13],[x,4.8,-2],materials.wood);
  const fixture=box(environment,'fluorescent-housing',[2.1,.12,.48],[x,4.62,-4.5],materials.metal);
  const tube=new THREE.MeshBasicMaterial({color:0xffefbf});
  box(environment,'fluorescent-diffuser',[1.95,.025,.34],[fixture.position.x,4.548,-4.5],tube);
 }
 const ring=new THREE.Group();ring.name='background-boxing-ring';ring.position.set(-4.35,0,-3.65);environment.add(ring);
 box(ring,'ring-platform',[5,.36,4.5],[0,.18,0],materials.navy);
 box(ring,'blue-ring-canvas',[4.9,.055,4.4],[0,.39,0],materials.blue);
 box(ring,'ring-apron-accent',[4.8,.14,.035],[0,.22,2.27],materials.red);
 for(const x of [-2.4,2.4])for(const z of [-2.15,2.15]){
  rod(ring,'ring-corner-post',new THREE.Vector3(x,.35,z),new THREE.Vector3(x,2.05,z),.065,materials.metal);
  box(ring,'padded-ring-corner',[.22,.8,.22],[x,1.43,z],x<0?materials.red:materials.blue);
 }
 for(const [i,y] of [.86,1.26,1.66].entries()){
  const material=i===1?materials.cream:i===0?materials.blue:materials.red;
  for(const z of [-2.15,2.15])rod(ring,'ring-rope',new THREE.Vector3(-2.4,y,z),new THREE.Vector3(2.4,y,z),.026,material);
  for(const x of [-2.4,2.4])rod(ring,'ring-rope',new THREE.Vector3(x,y,-2.15),new THREE.Vector3(x,y,2.15),.026,material);
 }
 const storage=new THREE.Group();storage.name='lockers-and-bench';environment.add(storage);
 for(let i=0;i<4;i++){
  const x=3.15+i*.64;
  box(storage,'locker',[.61,2.2,.65],[x,1.1,-6.45],materials.navy);
  box(storage,'locker-door',[.54,2.08,.035],[x,1.1,-6.1],materials.blue);
  box(storage,'locker-handle',[.035,.2,.05],[x+.17,1.14,-6.065],materials.cream);
  for(let j=0;j<3;j++)box(storage,'locker-vent',[.27,.025,.02],[x,1.85+j*.07,-6.07],materials.navy);
 }
 box(storage,'bench-seat',[2.85,.12,.55],[4.1,.55,-4.95],materials.wood);
 for(const x of [2.95,5.25])box(storage,'bench-leg',[.11,.5,.45],[x,.25,-4.95],materials.metal);
 // A pair of gloves on the bench and folded towels keep the gym lived in.
 for(const x of [3.2,3.55]){
  const glove=new THREE.Mesh(new THREE.SphereGeometry(.17,10,8),materials.red);glove.name='stored-boxing-glove';glove.scale.set(1,.75,1.15);glove.position.set(x,.75,-4.95);storage.add(glove);
 }
 for(let i=0;i<2;i++)box(storage,'folded-towel',[.58,.065,.38],[4.7,.65+i*.07,-4.95],materials.cream);
 // Original gym lettering made from low-cost line segments rather than external fonts.
 const glyphs:Record<string,string[]>={F:['111','100','110','100','100'],I:['111','010','010','010','111'],R:['110','101','110','101','101'],E:['111','100','110','100','111'],O:['111','101','101','101','111'],M:['101','111','111','101','101'],G:['111','100','101','101','111'],Y:['101','101','010','010','010']};
 const sign=new THREE.Group();sign.name='original-fireroom-gym-sign';sign.position.set(0,3.55,-6.8);environment.add(sign);
 box(sign,'sign-frame',[5.7,1.1,.12],[0,0,0],materials.wood);box(sign,'sign-board',[5.5,.92,.05],[0,0,.08],materials.cream);
 const text='FIREROOM GYM',unit=.065;let cursor=-2.17;
 const letterPositions:THREE.Vector3[]=[];
 for(const char of text){if(char===' '){cursor+=unit*3;continue;}glyphs[char]?.forEach((row,y)=>[...row].forEach((pixel,x)=>{if(pixel==='1')letterPositions.push(new THREE.Vector3(cursor+x*unit,.14-y*unit,.12));}));cursor+=unit*6;}
 const lettering=new THREE.InstancedMesh(new THREE.BoxGeometry(unit*.9,unit*.9,.018),materials.red,letterPositions.length);lettering.name='instanced-original-sign-lettering';
 letterPositions.forEach((position,index)=>lettering.setMatrixAt(index,new THREE.Matrix4().makeTranslation(position.x,position.y,position.z)));sign.add(lettering);
 for(const [x,color] of [[-3.9,materials.red],[6.2,materials.blue]] as const){
  box(environment,'training-poster-border',[.95,1.3,.04],[x,2.7,-6.87],materials.wood);
  box(environment,'training-poster-paper',[.86,1.21,.025],[x,2.7,-6.84],materials.cream);
  box(environment,'poster-header',[.61,.13,.012],[x,3.08,-6.82],color);
  for(let i=0;i<3;i++)box(environment,'poster-rule',[.55-i*.08,.035,.012],[x,2.48+i*.13,-6.82],materials.navy);
 }
 const bag=new THREE.Group();bag.name='heavy-bag-suspension-pivot';bag.position.set(0,2.7,-.3);environment.add(bag);
 const leather=new THREE.MeshToonMaterial({color:0x853c32});
 const seam=new THREE.MeshToonMaterial({color:0x542b27});
 const body=new THREE.Mesh(new THREE.CylinderGeometry(.37,.39,1.7,20),leather);body.name='traditional-leather-heavy-bag';body.position.y=-1.1;bag.add(body);
 for(const y of [-.28,-1.92]){
  const cap=new THREE.Mesh(new THREE.CylinderGeometry(.375,.375,.055,20),seam);cap.name='bag-stitched-end';cap.position.y=y;bag.add(cap);
 }
 for(const x of [-.25,.25]){
  const z=Math.sqrt(.39*.39-x*x);
  box(bag,'bag-longitudinal-seam',[.012,1.58,.012],[x,-1.1,z],seam);
 }
 const patch=box(bag,'bag-brand-patch',[.3,.22,.02],[0,-.75,.389],materials.cream);
 box(bag,'bag-brand-mark',[.21,.035,.012],[0,patch.position.y,.405],materials.red);
 for(const x of [-.27,.27])for(const z of [-.2,.2])rod(bag,'leather-suspension-strap',new THREE.Vector3(x,-.28,z),new THREE.Vector3(0,.37,0),.025,seam);
 rod(bag,'suspension-chain',new THREE.Vector3(0,.37,0),new THREE.Vector3(0,1.95,0),.022,materials.metal);
 box(environment,'bag-ceiling-anchor',[.55,.13,.5],[0,4.73,-.3],materials.metal);
 // Supporting scenery shares a warmer, lower-contrast finish; keep target leather unchanged.
 const muted=new Map<THREE.Material,THREE.Material>();
 for(const name of ['background-boxing-ring','lockers-and-bench','original-fireroom-gym-sign']){
  environment.getObjectByName(name)?.traverse(object=>{if(object instanceof THREE.Mesh && !Array.isArray(object.material)){
   const source=object.material as THREE.Material;
   let material=muted.get(source);
   if(!material){material=source.clone();if('color' in material)(material as THREE.MeshToonMaterial).color.lerp(new THREE.Color(0xb9a77d),.32);muted.set(source,material);}
   object.material=material;
  }});
 }
 return {environment,bag};
}
