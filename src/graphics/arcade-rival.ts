import * as THREE from 'three';
import type {CombatPhase} from '../game/arcade-combat-contracts';
import {finisherPose} from './arcade-finisher';

export interface RivalVisualState {
  phase?: CombatPhase;
  cinematicProgress?: number;
  opponentState: string;
  phaseProgress: number;
  opponentPunch?: 'jab' | 'cross';
  result?: 'win' | 'loss' | 'draw' | null;
  roundStatus?: string;
}

/** Original Ren Mori character. Lightweight articulated procedural anatomy, not a skinned asset.
 * Authored poses respond only to combat states; positions do not purport to track real fists. */
export function createArcadeRival() {
  const group = new THREE.Group(); group.name = 'Ren Mori';
  const materials: THREE.Material[] = [];
  const material = (color: string) => {
    const m = new THREE.MeshToonMaterial({ color }); materials.push(m); return m;
  };
  const skin = material('#c78c69'), muscle = material('#c58a67'), shadedSkin = material('#a96f52');
  const navy = material('#182738'), red = material('#a9252b'), gloveRed = material('#be3035');
  const cream = material('#e7d8bd'), hair = material('#222329'), hairLight = material('#323239');
  const eyeWhite = material('#e9dfcc'), iris = material('#343a37'), ink = material('#352a2b');
  const body = new THREE.Group(); group.add(body);
  const mesh = (geometry: THREE.BufferGeometry, mat: THREE.Material, parent: THREE.Object3D, x=0,y=0,z=0) => {
    const m = new THREE.Mesh(geometry,mat);m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;
  };
  const oval = (parent:THREE.Object3D,mat:THREE.Material,x:number,y:number,z:number,sx:number,sy:number,sz:number) => {
    const m=mesh(new THREE.SphereGeometry(1,20,14),mat,parent,x,y,z);m.scale.set(sx,sy,sz);return m;
  };
  const rod=(parent:THREE.Object3D,mat:THREE.Material,a:THREE.Vector3,b:THREE.Vector3,r1:number,r2:number) => {
    const m=mesh(new THREE.CylinderGeometry(r2,r1,1,12),mat,parent);
    const place=(from:THREE.Vector3,to:THREE.Vector3)=>{m.position.copy(from).add(to).multiplyScalar(.5);m.scale.y=from.distanceTo(to);m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),to.clone().sub(from).normalize());};place(a,b);return {mesh:m,place};
  };
  const v=(x:number,y:number,z:number)=>new THREE.Vector3(x,y,z);
  // Rounded ribcage tapering into a compact waist, with discrete subdued pectoral volumes.
  const profile=[v(.155,.89,0),v(.18,.98,0),v(.195,1.08,0),v(.235,1.21,0),v(.26,1.33,0),v(.235,1.40,0),v(.145,1.445,0)].map(p=>new THREE.Vector2(p.x,p.y));
  const torso=mesh(new THREE.LatheGeometry(profile,24),skin,body);torso.scale.z=.65;
  for(const side of [-1,1]) {
    const pec=oval(body,muscle,side*.113,1.305,.118,.128,.087,.052);pec.rotation.z=side*.10;
    oval(body,skin,side*.254,1.365,.005,.105,.103,.112);
    // Trapezius bridges the shoulder into the neck rather than leaving a floating head.
    const trap=oval(body,skin,side*.105,1.418,-.008,.13,.052,.078);trap.rotation.z=-side*.16;
    for(let i=0;i<3;i++)oval(body,muscle,side*.045,1.185-i*.065,.123-i*.007,.045,.034,.014);
  }
  rod(body,skin,v(0,1.39,0),v(0,1.575,0),.073,.064);
  const shorts=mesh(new THREE.LatheGeometry([new THREE.Vector2(.214,.82),new THREE.Vector2(.216,.86),new THREE.Vector2(.207,.9),new THREE.Vector2(.18,.965)],24),navy,body);shorts.scale.z=.73;shorts.name='rival-boxing-shorts';
  const waistband=mesh(new THREE.CylinderGeometry(.184,.195,.065,24),cream,body,0,.943,0);waistband.scale.z=.74;
  for(const side of [-1,1]) {
    const stripe=oval(body,red,side*.223,.817,.002,.014,.106,.12);stripe.rotation.z=-side*.09;
    const clothLeg=mesh(new THREE.LatheGeometry([new THREE.Vector2(.108,.70),new THREE.Vector2(.115,.735),new THREE.Vector2(.124,.82),new THREE.Vector2(.116,.865)],20),navy,body,side*.119,0,0);clothLeg.scale.z=1.21;clothLeg.name=side===-1?'left-shorts-leg':'right-shorts-leg';
    const hem=mesh(new THREE.CylinderGeometry(.11,.108,.016,20,1,true),cream,body,side*.119,.706,0);hem.scale.z=1.21;hem.name=side===-1?'rival-shorts-hem':'right-shorts-hem';
  }
  // Head: defined jaw and cheek planes under a rounded cranium, anime features without a mask.
  const head=new THREE.Group();head.position.set(0,1.635,.01);head.scale.setScalar(.88);body.add(head);
  oval(head,skin,0,.047,0,.115,.155,.104);
  const jaw=oval(head,skin,0,-.047,.028,.094,.088,.079);jaw.rotation.x=-.08;
  oval(head,skin,0,-.102,.045,.057,.034,.05);
  for(const side of [-1,1]) {
    oval(head,shadedSkin,side*.113,.012,-.005,.021,.038,.023);
    oval(head,skin,side*.113,.014,.002,.017,.029,.02);
    oval(head,skin,side*.068,-.013,.071,.048,.043,.034);
    const socket=oval(head,shadedSkin,side*.05,.031,.093,.043,.021,.012);socket.rotation.z=-side*.13;
    const eye=oval(head,eyeWhite,side*.05,.033,.102,.035,.013,.009);eye.rotation.z=side*.10;
    oval(head,iris,side*.047,.033,.11,.011,.012,.004);
    oval(head,ink,side*.046,.033,.113,.005,.009,.002);
    oval(head,cream,side*.043,.037,.115,.0025,.0025,.001);
  }
  const brows=([-1,1] as const).map(side=>{
    const brow=oval(head,hair,side*.05,.06,.099,.037,.008,.008);brow.rotation.z=side*.16;return {brow,side};
  });
  const nose=mesh(new THREE.ConeGeometry(.017,.058,4),skin,head,0,.002,.115);nose.rotation.x=.27;
  oval(head,shadedSkin,0,-.025,.116,.02,.007,.007);
  const mouth=oval(head,ink,0,-.064,.101,.032,.0035,.004);mouth.rotation.z=-.04;
  oval(head,shadedSkin,0,-.075,.095,.022,.003,.004);
  const cap=oval(head,hair,0,.139,-.014,.121,.075,.105);cap.rotation.z=-.06;
  // Small overlapping tapered locks form a deliberate swept silhouette at modest polygon cost.
  for(let i=0;i<15;i++) {
    const a=i*2.39996, radius=i<7?.055:.094;
    const lock=mesh(new THREE.ConeGeometry(.035,.083+(i%3)*.009,5),i%4===0?hairLight:hair,head,Math.sin(a)*radius,.18+(i<7?.015:0),Math.cos(a)*radius-.012);
    lock.rotation.set(.18+Math.cos(a)*.2,0,-.38+Math.sin(a)*.25);
  }
  for(let i=0;i<5;i++) {
    const lock=mesh(new THREE.ConeGeometry(.023,.072,5),hair,head,-.084+i*.039,.125,.075);
    lock.rotation.z=Math.PI+.25;lock.rotation.x=-.3;
  }
  const arms=([-1,1] as const).map(side=>{
    const upper=rod(body,skin,v(0,0,0),v(0,1,0),.086,.061);
    const fore=rod(body,skin,v(0,0,0),v(0,1,0),.067,.044);
    const elbow=oval(body,skin,0,0,0,.064,.066,.064);
    const bicep=oval(body,muscle,0,0,0,.079,.125,.08);
    const glove=new THREE.Group();body.add(glove);
    // Wrist at local origin; knuckle dome above, inward thumb and padded strap.
    oval(glove,gloveRed,0,.063,0,.094,.126,.105);
    oval(glove,red,0,.08,-.055,.083,.088,.062);
    const thumb=oval(glove,gloveRed,-side*.075,.022,.034,.043,.073,.05);thumb.rotation.z=side*.4;
    const cuff=mesh(new THREE.CylinderGeometry(.068,.063,.082,16),red,glove,0,-.065,0);cuff.scale.z=1.08;
    const band=mesh(new THREE.CylinderGeometry(.07,.07,.025,16),cream,glove,0,-.058,0);band.scale.z=1.09;
    oval(glove,cream,0,.08,.101,.031,.018,.003);
    const label=side===-1?'left':'right';
    upper.mesh.name=`${label}-upper-arm`;fore.mesh.name=`${label}-forearm`;elbow.name=`${label}-elbow`;glove.name=`${label}-glove`;
    return {side,upper,fore,elbow,bicep,glove};
  });
  const legs=([-1,1] as const).map(side=>{
    const thigh=rod(body,skin,v(0,0,0),v(0,1,0),.097,.064);
    const shin=rod(body,skin,v(0,0,0),v(0,1,0),.062,.038);
    const knee=oval(body,skin,0,0,0,.065,.071,.067);
    const calf=oval(body,skin,0,0,0,.064,.12,.065);
    const shoe=new THREE.Group();body.add(shoe);
    oval(shoe,navy,0,.095,.005,.068,.12,.085);
    oval(shoe,navy,0,.043,.066,.074,.058,.135);
    oval(shoe,cream,0,.018,.059,.077,.015,.138);
    for(let i=0;i<4;i++) {const lace=mesh(new THREE.CylinderGeometry(.003,.003,.082,5),cream,shoe,0,.1-i*.016,.078+i*.012);lace.rotation.z=Math.PI/2;}
    oval(shoe,red,side*.066,.075,.008,.006,.055,.036);
    return {side,thigh,shin,knee,calf,shoe, plantedWorldZ: 0, wasSwinging: true, wasMoving: false};
  });
  let reaction:{kind:'jab'|'cross'|'block';at:number}|null=null;
  let previousPhase='', recoveryFromAttack=false, lastStrikeSide=-1;
  const smooth=(x:number)=>{const a=THREE.MathUtils.clamp(x,0,1);return a*a*(3-2*a);};
  const update=(state:RivalVisualState,nowMs:number)=>{
    const cinematic=finisherPose(state.phase,state.cinematicProgress,state.result);
    // Impact holds one authored pose for the engine-owned 140 ms hit stop.
    const time=state.phase==='FINISHER_IMPACT'?0:nowMs/1000,phase=state.roundStatus&&state.roundStatus!=='running'?'guard':state.opponentState.toLowerCase(),p=THREE.MathUtils.clamp(state.phaseProgress||0,0,1);
    const moving=phase.includes('approach')||phase.includes('retreat');
    const step=moving?Math.sin(time*9):Math.sin(time*1.65)*.15;
    const recoilAge=reaction?nowMs-reaction.at:Infinity;
    const hit=state.phase!=='FINISHER_IMPACT'&&reaction&&reaction.kind!=='block'&&recoilAge>=0&&recoilAge<420?Math.sin(Math.min(1,recoilAge/90)*Math.PI*.5)*Math.exp(-recoilAge/160):0;
    const blocking=phase.includes('block')||phase==='guard'||(reaction?.kind==='block'&&recoilAge<240);
    const windup=phase.includes('wind')||phase.includes('telegraph');
    const attacking=phase==='attack'||phase.includes('strike');
    const recovering=phase.includes('recover');
    if(recovering&&!previousPhase.includes('recover'))recoveryFromAttack=previousPhase==='attack'||previousPhase.includes('strike');
    if(attacking)lastStrikeSide=state.opponentPunch==='cross'?1:-1;
    const extension=attacking?smooth(p/.62):recovering&&recoveryFromAttack?(1-smooth(p/.38)):0;
    const strikingSide=recovering?lastStrikeSide:state.opponentPunch==='cross'?1:-1;
    previousPhase=phase;
    const defeat=!state.phase&&state.result==='win'?smooth(p||1):cinematic.fall;
    const victory=state.result==='loss';
    body.position.set(Math.sin(time*1.8)*.012-hit*.035,.008*Math.sin(time*3.5),moving?Math.abs(step)*.009:-hit*.065);
    body.rotation.set(hit*.09,(state.opponentPunch==='cross'?-.19:.08)*extension+Math.sin(time*1.6)*.025,-hit*.12);
    if(cinematic.active){
      body.position.set(0,cinematic.height,-cinematic.backward);
      body.rotation.set(cinematic.tilt,0,cinematic.stun?.035*Math.sin(time*2):0);
    }
    head.rotation.set(.075+hit*.12+defeat*.3,-hit*.25,hit*.17);
    mouth.scale.y=.0035*(1+hit*3);
    for(const {brow,side} of brows)brow.rotation.z=side*(.16+hit*.16);
    for(const leg of legs) {
      const side=leg.side,footPhase=side*step;
      const lift=moving?Math.max(0,footPhase)*.048:0;
      const baseZ=side===-1?.18:-.17;
      const foot=v(side*.155,lift,baseZ);
      // A planted foot holds world position while the scene moves the root; the
      // other shoe lifts and steps. Combat distance remains owned by gameplay.
      const swinging=moving&&footPhase>0;
      if(moving) {
        if(swinging) foot.z+=Math.cos(time*9+(side===1?Math.PI:0))*.065;
        else {
          if(leg.wasSwinging||!leg.wasMoving)leg.plantedWorldZ=group.position.z+baseZ;
          foot.z=THREE.MathUtils.clamp(leg.plantedWorldZ-group.position.z,baseZ-.16,baseZ+.16);
        }
      }
      leg.wasSwinging=swinging;leg.wasMoving=moving;
      const knee=v(side*.16,.40+lift*.4,foot.z+.05),hip=v(side*.13,.79,0);
      leg.thigh.place(hip,knee);leg.shin.place(knee,foot.clone().add(v(0,.13,0)));leg.knee.position.copy(knee);
      leg.calf.position.copy(knee).lerp(foot,.44);leg.shoe.position.copy(foot);leg.shoe.rotation.y=-side*.1;
    }
    for(const arm of arms) {
      const side=arm.side,isStrike=side===strikingSide;
      const ext=isStrike?extension:0;
      const shoulder=v(side*.26,1.365,0);
      // Make the authored blocking window readable: closed gloves at the cheeks,
      // wider/lower hands during recovery, retreat and hit reaction.
      const open=recovering||phase.includes('retreat')||phase.includes('hit');
      const wrist=v(side*(blocking?.155:open?.30:.215),blocking?1.57:open?1.19:1.43,.20+(side===-1?.035:0));
      wrist.y+=Math.sin(time*3+side)*.008;
      if(windup&&isStrike){wrist.z-=p*.07;wrist.x+=side*p*.035;}
      wrist.lerp(v(side*.045,1.47,.70),ext);
      if(cinematic.stun)wrist.lerp(v(side*.29,1.13,.17),.9);
      if(victory)wrist.lerp(v(side*.26,1.89,.06),.85);
      if(defeat)wrist.lerp(v(side*.25,1.0,.12),defeat*.8);
      const elbow=v(side*(blocking?.23:.285)-side*ext*.15,(blocking?1.23:open?1.02:1.14)+ext*.19,.14+ext*.22);
      arm.upper.place(shoulder,elbow);arm.fore.place(elbow,wrist);arm.elbow.position.copy(elbow);
      arm.bicep.position.copy(shoulder).lerp(elbow,.5);arm.bicep.quaternion.copy(arm.upper.mesh.quaternion);
      arm.glove.position.copy(wrist);arm.glove.rotation.set(-ext*1.12,.08*side,-side*.18+side*ext*.13);
    }
  };
  update({opponentState:'guard',phaseProgress:0},0);
  return {group,update,hit(kind:'jab'|'cross'|'block',nowMs:number){reaction={kind,at:nowMs};},dispose(){group.traverse(o=>{if(o instanceof THREE.Mesh)o.geometry.dispose();});materials.forEach(m=>m.dispose());}};
}
