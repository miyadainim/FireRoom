import {describe,it,expect} from 'vitest';
import {readActivePairing,saveActivePairing} from '../src/platform/active-pairing';
import {PoseReceiver} from '../src/platform/transport';
describe('viewer mode pairing handoff',()=>{
 it('retains the phone session and consumed sequence across mode reloads',()=>{
  const values=new Map<string,string>();const storage={getItem:(k:string)=>values.get(k)??null,setItem:(k:string,v:string)=>{values.set(k,v);}};
  expect(readActivePairing(storage)).toBeNull();
  saveActivePairing(storage,{sessionId:'same-phone',phoneOrigin:'https://phone.example',lastSequence:42});
  expect(readActivePairing(storage)).toEqual({sessionId:'same-phone',phoneOrigin:'https://phone.example',lastSequence:42});
  expect(new PoseReceiver('same-phone',42).status(0).lastSequence).toBe(42);
  // Restored pairing must wait for fresh arrivals, never claim an already-connected camera.
  expect(new PoseReceiver('same-phone',42).status(0).status).toBe('disconnected');
 });
 it('ignores malformed storage and survives unavailable storage',()=>{
  for(const value of ['broken','{}','{"sessionId":"x","phoneOrigin":"x","lastSequence":-5}'])expect(readActivePairing({getItem:()=>value})).toBeNull();
  expect(readActivePairing({getItem:()=>{throw Error('blocked');}})).toBeNull();
  expect(()=>saveActivePairing({setItem:()=>{throw Error('blocked');}},{sessionId:'x',phoneOrigin:'https://example.test',lastSequence:0})).not.toThrow();
 });
 it('rejects already consumed frames after switching modes and resumes on fresh data',()=>{
  const receiver=new PoseReceiver('same-phone',42);
  const frame={schemaVersion:1,sessionId:'same-phone',sequence:42,timestampMs:500,mirrored:false,stance:'orthodox',tracking:'tracked',landmarks:Array.from({length:33},()=>({x:.5,y:.5,z:0,visibility:1}))};
  expect(receiver.accept(frame,10)).toBeNull();
  expect(receiver.accept({...frame,sequence:41},20)).toBeNull();
  expect(receiver.status(20).status).toBe('disconnected');
  expect(receiver.accept({...frame,sequence:43},30)).not.toBeNull();
  expect(receiver.status(30).status).toBe('connected');
 });
});
