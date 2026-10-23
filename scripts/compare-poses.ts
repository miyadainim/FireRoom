import {readFileSync,writeFileSync} from 'node:fs';
import {compareRecording} from '../src/vision/recording';
import {isPoseFrame} from '../src/shared/contracts';
const input=process.argv[2];if(!input)throw Error('Usage: compare-poses <recording.json> [output.json]');
const data=JSON.parse(readFileSync(input,'utf8'));const recording=data.recording??data;
if(recording.schemaVersion!==1||recording.kind!=='fireroom-labeled-poses'||!Array.isArray(recording.trials)||recording.trials.some((t:any)=>!['jab','cross','jab-cross','cross-jab','none'].includes(t.label)||!Array.isArray(t.frames)||!t.frames.every(isPoseFrame)))throw Error('Invalid pose recording');
const comparisons=compareRecording(recording);if(process.argv[3])writeFileSync(process.argv[3],JSON.stringify(comparisons,null,2));
console.log(JSON.stringify(comparisons.map(({trials,...summary})=>({...summary,trialSequences:trials.map(t=>({label:t.label,detected:t.detected,available:t.available,exact:t.exact}))})),null,2));
