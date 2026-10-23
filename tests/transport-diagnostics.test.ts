import {it,expect} from 'vitest';
import {isTransportTimings} from '../src/shared/transport-diagnostics';
const sample={id:0,kind:'upload',atMs:100,durationMs:20,sequence:3,count:2,status:200};
it('accepts bounded relative timing records without extending pose contracts',()=>{
 expect(isTransportTimings([sample])).toBe(true);expect(isTransportTimings([])).toBe(true);
 for(const changed of [{durationMs:-1},{atMs:Infinity},{id:.5},{kind:'video'},{rawVideo:'payload'}])expect(isTransportTimings([{...sample,...changed}])).toBe(false);
 expect(isTransportTimings(Array.from({length:25},()=>sample))).toBe(false);
});
