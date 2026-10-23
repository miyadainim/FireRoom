import {describe,it,expect} from 'vitest';
import {isPoseFrame,isGameAction,type PoseFrame} from '../src/shared/contracts';
const frame=():PoseFrame=>({schemaVersion:1,sessionId:'test',sequence:0,timestampMs:0,mirrored:false,stance:'orthodox',tracking:'tracked',landmarks:Array.from({length:33},()=>({x:0.5,y:0.5,z:0,visibility:1}))});
describe('v1 pose contract',()=>{
 it('accepts unmirrored anatomical landmarks and both stances',()=>{expect(isPoseFrame(frame())).toBe(true);expect(isPoseFrame({...frame(),stance:'southpaw'})).toBe(true)});
 it('rejects malformed envelopes, mirroring and unsupported schemas',()=>{for(const change of [{schemaVersion:2},{sessionId:''},{sequence:-1},{sequence:1.1},{timestampMs:NaN},{mirrored:true},{tracking:'unknown'},{stance:'unknown'}])expect(isPoseFrame({...frame(),...change})).toBe(false)});
 it('rejects missing landmarks, nonfinite coordinates and invalid confidence',()=>{expect(isPoseFrame({...frame(),landmarks:[]})).toBe(false);for(const change of [{x:Infinity},{visibility:-0.1},{visibility:1.1}]){const f=frame();f.landmarks[0]={...f.landmarks[0],...change};expect(isPoseFrame(f)).toBe(false)}});
 it('allows explicit tracking loss with no landmarks',()=>{expect(isPoseFrame({...frame(),tracking:'lost',landmarks:[]})).toBe(true)});
});
describe('coach action permission boundary',()=>{
 it('accepts only known action names and bounded parameters',()=>{for(const a of [{schemaVersion:1,type:'replay_combo'},{schemaVersion:1,type:'get_performance_summary'},{schemaVersion:1,type:'set_playback_speed',speed:0.25},{schemaVersion:1,type:'set_playback_speed',speed:0.5},{schemaVersion:1,type:'set_playback_speed',speed:1},{schemaVersion:1,type:'load_drill',drill:'jab-cross'},{schemaVersion:1,type:'highlight_movement',movement:'guard'}])expect(isGameAction(a)).toBe(true);for(const a of [null,{}, {type:'replay_combo'}, {schemaVersion:2,type:'replay_combo'}, {schemaVersion:1,type:'shell',command:'anything'},{schemaVersion:1,type:'set_playback_speed',speed:2},{schemaVersion:1,type:'load_drill',drill:'hook'},{schemaVersion:1,type:'highlight_movement',movement:'force'}])expect(isGameAction(a)).toBe(false)});
});
