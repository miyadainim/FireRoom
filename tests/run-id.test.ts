import {afterEach,describe,it,expect,vi} from 'vitest';
import {createRunId} from '../src/platform/run-id';
afterEach(()=>vi.unstubAllGlobals());
describe('non-security recording correlation IDs',()=>{
 it('uses the secure-context UUID API when available',()=>{vi.stubGlobal('crypto',{randomUUID:()=> 'uuid'});expect(createRunId()).toBe('uuid');});
 it('supports HTTP viewers with getRandomValues but no randomUUID',()=>{vi.stubGlobal('crypto',{getRandomValues:(a:Uint8Array)=>{a.fill(7);return a;}});expect(createRunId()).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);});
 it('does not strand practice when crypto APIs are absent',()=>{vi.stubGlobal('crypto',undefined);expect(createRunId()).not.toBe(createRunId());});
});
