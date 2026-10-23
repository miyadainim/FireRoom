import * as THREE from 'three';

/** Static ring dressing. Canvas maps replace individual plank/seam/letter meshes. */
export function createArcadeGym() {
 const group=new THREE.Group();group.name='classic-arcade-boxing-gym';
 const textures:THREE.Texture[]=[];
 const mat=(color:number)=>new THREE.MeshToonMaterial({color});
 const cream=mat(0xd9cba5),navy=mat(0x293c48),red=mat(0x9b4137),blue=mat(0x536e7a),metal=mat(0x454741),wood=mat(0x826349),wall=mat(0xc7b68c);
 const glow=new THREE.MeshBasicMaterial({color:0xffe6ae});
 function texture(draw:(c:CanvasRenderingContext2D)=>void,w=1024,h=1024){
  if(typeof document==='undefined')return undefined;
  const canvas=document.createElement('canvas');canvas.width=w;canvas.height=h;
  const c=canvas.getContext('2d');if(!c)return undefined;draw(c);
  const t=new THREE.CanvasTexture(canvas);t.colorSpace=THREE.SRGBColorSpace;textures.push(t);return t;
 }
 function box(name:string,size:[number,number,number],pos:[number,number,number],material:THREE.Material,parent:THREE.Object3D=group){const m=new THREE.Mesh(new THREE.BoxGeometry(...size),material);m.name=name;m.position.set(...pos);parent.add(m);return m;}
 function rod(name:string,a:[number,number,number],b:[number,number,number],radius:number,material:THREE.Material){const start=new THREE.Vector3(...a),end=new THREE.Vector3(...b),d=end.clone().sub(start);const m=new THREE.Mesh(new THREE.CylinderGeometry(radius,radius,d.length(),8),material);m.name=name;m.position.copy(start).add(end).multiplyScalar(.5);m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),d.normalize());group.add(m);return m;}
 // Deterministic marks: no flicker or random regeneration when entering a round.
 let seed=147;const random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
 const floorMap=texture(c=>{c.fillStyle='#846b50';c.fillRect(0,0,1024,1024);for(let y=0;y<1024;y+=64){c.fillStyle=y%128?'#8a7054':'#92785b';c.fillRect(0,y,1024,62);for(let x=(y%128?128:0);x<1024;x+=256){c.fillStyle='#67533f';c.fillRect(x,y,2,64);}}c.strokeStyle='rgba(50,35,22,.15)';for(let i=0;i<190;i++){const x=random()*1024,y=random()*1024;c.beginPath();c.moveTo(x,y);c.lineTo(x+random()*100,y+1);c.stroke();}});
 const floor=new THREE.Mesh(new THREE.PlaneGeometry(18,18),new THREE.MeshToonMaterial({color:0xcbb596,map:floorMap??null}));floor.name='worn-wood-plank-floor';floor.rotation.x=-Math.PI/2;floor.position.set(0,-.19,-1);group.add(floor);
 box('ring-raised-foundation',[8.25,.16,9.25],[0,-.09,-.5],navy);
 const canvasMap=texture(c=>{c.fillStyle='#b5a98b';c.fillRect(0,0,1024,1024);c.strokeStyle='rgba(75,67,52,.10)';c.lineWidth=2;for(let i=0;i<1024;i+=16){c.beginPath();c.moveTo(0,i);c.lineTo(1024,i);c.stroke();}for(let i=0;i<280;i++){const x=random()*1024,y=random()*1024;c.strokeStyle=`rgba(72,62,43,${.015+random()*.035})`;c.lineWidth=1+random()*3;c.beginPath();c.moveTo(x,y);c.lineTo(x+random()*36-18,y+random()*20-10);c.stroke();}c.strokeStyle='rgba(79,66,49,.20)';c.lineWidth=2;c.strokeRect(28,28,968,968);c.save();c.translate(512,540);c.rotate(-Math.PI/2);c.fillStyle='rgba(94,58,45,.13)';c.font='bold 58px serif';c.textAlign='center';c.fillText('FIRE ROOM',0,0);c.restore();});
 const canvas=new THREE.Mesh(new THREE.PlaneGeometry(8,9),new THREE.MeshToonMaterial({color:0xe6dcc0,map:canvasMap??null}));canvas.name='aged-training-ring-canvas';canvas.rotation.x=-Math.PI/2;canvas.position.set(0,.001,-.5);canvas.receiveShadow=true;group.add(canvas);
 box('gym-rear-plaster-wall',[18,5.2,.18],[0,2.4,-6.65],wall);box('gym-left-plaster-wall',[.18,5.2,18],[-8.9,2.4,-1],wall);box('gym-right-plaster-wall',[.18,5.2,18],[8.9,2.4,-1],wall);
 box('rear-wainscot',[18,2.0,.06],[0,.6,-6.52],blue);box('rear-timber-trim',[18,.075,.1],[0,1.63,-6.47],wood);
 box('ceiling',[18,.12,18],[0,5,-1],navy);
 for(const x of [-6,0,6]){box('ceiling-beam',[.18,.26,17],[x,4.85,-1],wood);for(const z of [-3.5,2]){rod('industrial-lamp-hanger',[x,4.75,z],[x,4.35,z],.025,metal);box('industrial-lamp-housing',[1.8,.13,.5],[x,4.3,z],metal);box('warm-lamp-diffuser',[1.65,.025,.39],[x,4.22,z],glow);}}
 for(const x of [-4,4])for(const z of [-5,4]){const color=x<0?red:blue;rod('ring-steel-corner-post',[x,-.1,z],[x,1.8,z],.07,metal);box('padded-corner-post',[.19,1.02,.19],[x,1.18,z],color);for(const y of [.55,1.02,1.49]){const inwardX=x-Math.sign(x)*.16,inwardZ=z+(z<0?.16:-.16);rod('corner-turnbuckle',[x,y,z],[inwardX,y,inwardZ],.045,metal);const pad=box('turnbuckle-leather-pad',[.21,.14,.21],[inwardX,y,inwardZ],color);pad.rotation.y=Math.PI/4;}}
 for(const [i,y] of [.55,1.02,1.49].entries()){const material=[blue,cream,red][i];for(const z of [-5,4])rod('ring-tension-rope',[-4,y,z],[4,y,z],.026,material);for(const x of [-4,4])rod('ring-tension-rope',[x,y,-5],[x,y,4],.026,material);}
 // Background objects stay outside the fighting floor and away from the rival silhouette.
 for(const x of [-6.3,6.4]){rod('bag-chain',[x,4.8,-4.6],[x,2.8,-4.6],.017,metal);const body=new THREE.Mesh(new THREE.CylinderGeometry(.32,.34,1.5,12),x<0?red:navy);body.name='background-leather-heavy-bag';body.position.set(x,1.94,-4.6);group.add(body);for(const y of [1.22,2.66]){const band=new THREE.Mesh(new THREE.CylinderGeometry(.342,.342,.055,12),wood);band.name='heavy-bag-end-seam';band.position.set(x,y,-4.6);group.add(band);}box('heavy-bag-cream-label',[.27,.2,.025],[x,2.15,-4.255],cream);}
 box('training-bench',[2.8,.12,.55],[-5.75,.37,-5.7],wood);for(const x of [-6.8,-4.7])box('bench-leg',[.1,.43,.45],[x,.1,-5.7],metal);
 for(let i=0;i<3;i++){const x=4.8+i*.62;box('background-locker',[.59,1.95,.55],[x,.8,-6.15],navy);box('locker-door',[.53,1.83,.03],[x,.8,-5.86],blue);box('locker-handle',[.035,.15,.035],[x+.15,.85,-5.83],cream);}
 function placard(name:string,x:number,y:number,w:number,h:number,draw:(c:CanvasRenderingContext2D)=>void){box(`${name}-frame`,[w+.1,h+.1,.05],[x,y,-6.47],wood);const map=texture(draw,1024,512);const mesh=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshToonMaterial({color:map?0xffffff:0xd8c9a4,map:map??null}));mesh.position.set(x,y,-6.43);mesh.name=name;group.add(mesh);}
 placard('fireroom-gym-sign',0,3.25,4.4,1.05,c=>{c.fillStyle='#d7c6a0';c.fillRect(0,0,1024,512);c.strokeStyle='#8e4036';c.lineWidth=8;c.strokeRect(25,25,974,462);c.textAlign='center';c.fillStyle='#563a2f';c.font='bold 98px Georgia, serif';c.fillText('FIRE ROOM',512,226);c.font='36px Georgia, serif';c.fillText('BOXING CLUB  •  EST. 1986',512,326);});
 for(const [x,title] of [[-4.9,'KEEP YOUR GUARD'],[4.7,'TRAIN WITH HEART']] as const)placard('vintage-boxing-poster',x,2.7,1.16,1.55,c=>{c.fillStyle='#cabb95';c.fillRect(0,0,1024,512);c.fillStyle='#93453b';c.fillRect(50,45,924,75);c.fillStyle='#e1d2ae';c.textAlign='center';c.font='bold 52px serif';c.fillText(title,512,102);c.fillStyle='#3b4a50';c.beginPath();c.arc(512,207,45,0,Math.PI*2);c.fill();c.fillRect(460,245,104,140);c.beginPath();c.ellipse(409,258,50,35,-.5,0,Math.PI*2);c.ellipse(615,258,50,35,.5,0,Math.PI*2);c.fill();c.fillStyle='#93453b';c.fillRect(170,429,684,10);});
 return {group,dispose(){const geometries=new Set<THREE.BufferGeometry>(),materials=new Set<THREE.Material>();group.traverse(o=>{if(o instanceof THREE.Mesh){geometries.add(o.geometry);for(const m of Array.isArray(o.material)?o.material:[o.material])materials.add(m);}});geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());textures.forEach(t=>t.dispose());}};
}
