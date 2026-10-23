import {describe,expect,it,vi} from 'vitest';
import {Readable} from 'node:stream';
import type {PoseFrame} from '../src/shared/contracts';
// @ts-expect-error JavaScript server entry has no declaration file.
import {handleRequest} from '../scripts/relay.mjs';
async function request(path:string,value?:unknown){
 const req=Readable.from(value===undefined?[]:[Buffer.from(typeof value==='string'?value:JSON.stringify(value))]) as Readable&{url:string;method:string};
 req.url=path;req.method=value===undefined?'GET':'POST';let status=200,body='';
 await handleRequest(req,{setHeader:()=>{},writeHead:(code:number)=>{status=code;},end:(text:string)=>{body=text;}});
 return {status,data:JSON.parse(body)};
}
async function session(){return (await request('/api/session',{})).data.sessionId as string;}
const frame=(sessionId:string,sequence:number):PoseFrame=>({schemaVersion:1,sessionId,sequence,timestampMs:sequence*40,stance:'orthodox',mirrored:false,tracking:'lost',landmarks:[]});
const post=(id:string,frames:unknown[])=>request(`/api/frames?session=${id}`,{schemaVersion:1,frames});
const get=(id:string,after=-1)=>request(`/api/frames?session=${id}&after=${after}`);
describe('bounded ordered pose-frame relay history',()=>{
 it('interoperates with legacy latest-frame transport and ordered cursor reads',async()=>{
  const id=await session();expect((await get(id)).data).toMatchObject({schemaVersion:1,frames:[],diagnostics:{phoneTimings:[],latestFrameAgeMs:null}});
  await request(`/api/frame?session=${id}`,frame(id,0));
  expect((await post(id,[frame(id,1),frame(id,2)])).status).toBe(200);
  expect((await get(id)).data.frames).toEqual([frame(id,0),frame(id,1),frame(id,2)]);
  expect((await get(id,0)).data.frames).toEqual([frame(id,1),frame(id,2)]);
  expect((await request(`/api/frame?session=${id}`)).data).toEqual(frame(id,2));
  expect((await request(`/api/frame?session=${id}`,frame(id,1))).status).toBe(409);
  expect((await get(id,2)).data.frames).toEqual([]);
 });
 it('rejects invalid batches atomically, including a late invalid frame and wrong session',async()=>{
  const id=await session();await post(id,[frame(id,0)]);
  for(const frames of [[],Array.from({length:9},(_,i)=>frame(id,i+1)),[frame(id,1),{...frame(id,2),tracking:'invalid'}],[frame(id,1),frame('other',2)]]){
   expect((await post(id,frames)).status).toBe(400);
   expect((await get(id)).data.frames).toEqual([frame(id,0)]);
  }
  expect((await request(`/api/frames?session=${id}`,{schemaVersion:2,frames:[frame(id,1)]})).status).toBe(400);
  expect((await request(`/api/frames?session=${id}`,'{')).status).toBe(400);
  expect((await post('missing',[frame('missing',0)])).status).toBe(404);
 });
 it('rejects stale and unordered complete batches before mutation',async()=>{
  const id=await session();await post(id,[frame(id,3)]);
  for(const frames of [[frame(id,3)],[frame(id,4),frame(id,4)],[frame(id,5),frame(id,4)]]){
   expect((await post(id,frames)).status).toBe(409);
   expect((await get(id)).data.frames).toEqual([frame(id,3)]);
   expect((await request(`/api/frame?session=${id}`)).data).toEqual(frame(id,3));
  }
 });
 it('bounds retained history to32 while keeping the latest legacy frame',async()=>{
  const id=await session();
  for(let i=0;i<40;i+=8)expect((await post(id,Array.from({length:8},(_,j)=>frame(id,i+j)))).status).toBe(200);
  expect((await get(id)).data.frames.map((f:PoseFrame)=>f.sequence)).toEqual(Array.from({length:32},(_,i)=>i+8));
  await request(`/api/frame?session=${id}`,frame(id,40));
  expect((await get(id)).data.frames.map((f:PoseFrame)=>f.sequence)).toEqual(Array.from({length:32},(_,i)=>i+9));
 });
 it('expires buffered delivery after350ms by local arrival without changing750ms latest semantics',async()=>{
  const clock=vi.spyOn(Date,'now').mockReturnValue(10000);
  try{
   const id=await session();await post(id,[frame(id,0)]);clock.mockReturnValue(10200);await post(id,[frame(id,1)]);
   clock.mockReturnValue(10350);expect((await get(id)).data.frames).toEqual([frame(id,0),frame(id,1)]);
   clock.mockReturnValue(10351);expect((await get(id)).data.frames).toEqual([frame(id,1)]);
   clock.mockReturnValue(10551);expect((await get(id)).data.frames).toEqual([]);
   expect((await request(`/api/frame?session=${id}`)).data).toEqual(frame(id,1));
   clock.mockReturnValue(10950);expect((await request(`/api/frame?session=${id}`)).data).toBeNull();
  }finally{clock.mockRestore();}
 });
 it('validates optional timing metadata atomically and reports only local relay durations',async()=>{
  const clock=vi.spyOn(Date,'now').mockReturnValue(10000);
  try{
   const id=await session(),timing={id:1,kind:'upload',atMs:123,durationMs:40,sequence:0,count:1,status:200};
   const send=(sequence:number,timings:unknown)=>request(`/api/frames?session=${id}`,{schemaVersion:1,frames:[frame(id,sequence)],timings});
   expect((await send(0,[timing])).status).toBe(200);
   clock.mockReturnValue(10150);
   const response=(await get(id)).data;
   expect(response.diagnostics.phoneTimings).toEqual([timing]);
   expect(response.diagnostics.latestFrameAgeMs).toBe(150);
   expect(response.diagnostics.relayWorkMs).toBeGreaterThanOrEqual(0);
   expect(Number.isFinite(response.diagnostics.relayWorkMs)).toBe(true);
   for(const invalid of [null,{},Array(25).fill(timing),[{...timing,durationMs:-1}],[{...timing,rawVideo:'no'}]]){
    expect((await send(1,invalid)).status).toBe(400);
    expect((await get(id)).data.frames).toEqual([frame(id,0)]);
    expect((await get(id)).data.diagnostics.phoneTimings).toEqual([timing]);
   }
   expect((await send(0,[])).status).toBe(409);
   expect((await get(id)).data.diagnostics.phoneTimings).toEqual([timing]);
   await post(id,[frame(id,1)]);
   expect((await get(id)).data.diagnostics.phoneTimings).toEqual([timing]);
   await request(`/api/frame?session=${id}`,frame(id,2));
   expect((await get(id)).data.diagnostics.phoneTimings).toEqual([timing]);
   expect((await send(3,[])).status).toBe(200);
   expect((await get(id)).data.diagnostics.phoneTimings).toEqual([]);
  }finally{clock.mockRestore();}
 });
 it('rejects malformed cursors and byte-oversized batches',async()=>{
  const id=await session();
  for(const after of ['NaN','-2','1.5'])expect((await request(`/api/frames?session=${id}&after=${after}`)).status).toBe(400);
  expect((await request(`/api/frames?session=${id}`,{schemaVersion:1,frames:[frame(id,0)],padding:'é'.repeat(80000)})).status).toBe(400);
  expect((await get(id)).data.frames).toEqual([]);
 });
});
