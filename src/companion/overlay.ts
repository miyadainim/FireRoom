import type {PoseFrame} from '../shared/contracts';
/** Canvas shares mirrored preview transform; inference coordinates remain untouched. */
export function drawPose(canvas:HTMLCanvasElement,frame:PoseFrame){
 const ctx=canvas.getContext('2d');if(!ctx)return;ctx.clearRect(0,0,canvas.width,canvas.height);
 const point=(i:number)=>frame.landmarks[i];
 ctx.lineWidth=5;
 for(const [a,b] of [[0,2],[0,5],[2,7],[5,8],[11,12],[11,13],[13,15],[12,14],[14,16],[11,23],[12,24],[23,24]]){
  const p=point(a),q=point(b);if(!p||!q)continue;ctx.strokeStyle=Math.min(p.visibility,q.visibility)>=.65?'#55f3bd':'#ffb34d';ctx.beginPath();ctx.moveTo(p.x*canvas.width,p.y*canvas.height);ctx.lineTo(q.x*canvas.width,q.y*canvas.height);ctx.stroke();
 }
 for(const i of [0,2,5,7,8,11,12,13,14,15,16]){const p=point(i);if(!p)continue;ctx.fillStyle=p.visibility>=.65?'#55f3bd':'#ffb34d';ctx.beginPath();ctx.arc(p.x*canvas.width,p.y*canvas.height,7,0,Math.PI*2);ctx.fill();}
}
