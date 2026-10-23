import type {LessonState,PunchEvent,TechniqueReport} from '../shared/contracts';
export function initialLesson(drill:'jab'|'jab-cross'='jab-cross'):LessonState{return {schemaVersion:1,drill,phase:'demo',expectedIndex:0,repetitions:0,targetRepetitions:3,score:0};}
export function applyPunch(state:LessonState,event:PunchEvent):{state:LessonState;report:TechniqueReport}{
 const expected=state.drill==='jab'?['jab']:['jab','cross'];
 const correct=event.type===expected[state.expectedIndex];
 const score=correct?Math.round(60*event.confidence+25*Math.min(1,event.extension)+(event.guardMaintained?15:0)):0;
 let next={...state,phase:'practice' as LessonState['phase'],expectedIndex:correct?state.expectedIndex+1:0,score:state.score+score};
 if(next.expectedIndex===expected.length){next.expectedIndex=0;next.repetitions++;if(next.repetitions>=state.targetRepetitions)next.phase='complete';}
 if(state.phase==='complete')next=state;
 return {state:next,report:{schemaVersion:1,sessionId:event.sessionId,sequence:event.sequence,timestampMs:event.timestampMs,tracking:'tracked',punches:[event],sequenceCorrect:correct,score:state.phase==='complete'?0:score,observations:[correct?'Expected punch recovered.':'Sequence mismatch: restart with a jab.',event.guardMaintained?'Opposite hand met the face-relative guard checks.':'Opposite hand did not continuously meet the face-relative guard checks.'],limitations:['Virtual technique score; not punch force.','Camera landmarks are estimates.']}};
}
