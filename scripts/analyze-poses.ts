import {readFileSync,writeFileSync} from 'node:fs';
import type {GeometryMode} from '../src/shared/contracts';
import {PunchRecognizer} from '../src/vision/recognizer';
import {GuardEstimator} from '../src/vision/guard';
const input=process.argv[2];if(!input)throw Error('Usage: analyze-poses <recording.json> <report.json>');
const data=JSON.parse(readFileSync(input,'utf8'));const recording=data.recording??data;
const mode=(process.argv[4]??'image-3d') as GeometryMode;
const report=recording.trials.map((trial:any,index:number)=>{
 const recognizer=new PunchRecognizer(mode),guard=new GuardEstimator(mode);const events:any[]=[],timeline:any[]=[];const start=trial.frames[0]?.timestampMs??0;
 for(const frame of trial.frames){const emitted=recognizer.update(frame);events.push(...emitted);timeline.push({timeMs:frame.timestampMs-start,sequence:frame.sequence,tracking:frame.tracking,guard:guard.update(frame),diagnostic:recognizer.diagnostics(),events:emitted});}
 const count=(values:string[])=>Object.fromEntries([...new Set(values)].map(key=>[key,values.filter(v=>v===key).length]));
 const range=(v:number[])=>{const a=v.filter(Number.isFinite).sort((a,b)=>a-b);return a.length?{min:a[0],median:a[Math.floor(a.length/2)],max:a.at(-1)}:null;};
 return {trial:index+1,label:trial.label,frames:timeline.length,events,reasonCounts:count(timeline.map(t=>t.diagnostic.reason)),arms:Object.fromEntries(['left','right'].map(hand=>{const g=timeline.map(t=>t.guard[hand]);const a=timeline.map(t=>t.diagnostic.arms?.[hand]).filter(Boolean);return [hand,{guardReasons:count(g.map(e=>e.reason)),guardStatuses:count(g.map(e=>e.status)),depthOffset:range(g.map(e=>e.depthOffset).filter(v=>v!==null)),faceDistance:range(g.map(e=>e.faceDistance).filter(v=>v!==null)),elbowAngle:range(g.map(e=>e.elbowAngle).filter(v=>v!==null)),extension:range(a.map(e=>e.extension)),travel:range(a.map(e=>e.travel)),phaseCounts:count(a.map(e=>e.phase))}];})),timeline};
});
writeFileSync(process.argv[3]??'/tmp/fireroom-pose-analysis.json',JSON.stringify(report,null,2));
console.log(JSON.stringify(report.map(({timeline,...rest}:any)=>rest),null,2));
