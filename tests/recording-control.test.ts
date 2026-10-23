import {describe,expect,it,vi} from 'vitest';
import {Readable} from 'node:stream';
import {isRecordingCommand,isFreshRecordingCommand,RECORDING_COMMAND_TTL_MS} from '../src/shared/recording';
// Relay is the same Node server used by npm run relay.
// @ts-expect-error JavaScript server entry has no declaration file.
import {handleRequest} from '../scripts/relay.mjs';
const base='http://local-test';
async function fetch(url:string,options?:{method?:string;body?:string}){
 const req=Readable.from(options?.body?[Buffer.from(options.body)]:[]) as Readable&{url:string;method:string};
 req.url=new URL(url).pathname+new URL(url).search;req.method=options?.method??'GET';
 let status=200,body='';
 const res={setHeader:()=>{},writeHead:(code:number)=>{status=code;},end:(value:string)=>{body=value;}};
 await handleRequest(req,res);return {status,json:async()=>JSON.parse(body)};
}
const command=(sequence=0)=>({schemaVersion:1 as const,id:`command-${sequence}`,runId:'attempt-1',sequence,action:'start' as const,kind:'practice' as const,issuedAtUnixMs:Date.now()});
async function session(){return (await (await fetch(`${base}/api/session`,{method:'POST'})).json()).sessionId;}
const post=(id:string,value:unknown)=>fetch(`${base}/api/recording?session=${id}`,{method:'POST',body:JSON.stringify(value)});
describe('metadata-only recording control',()=>{
 it('validates exact bounded metadata and rejects raw video and malformed controls',()=>{
  expect(isRecordingCommand(command())).toBe(true);
  for(const invalid of [{...command(),video:'blob'}, {...command(),sequence:-1},{...command(),issuedAtUnixMs:Infinity},{...command(),id:''},{...command(),action:'upload'},[]])expect(isRecordingCommand(invalid)).toBe(false);
 });
 it('bounds issued timestamp freshness without using it for synchronization',()=>{
  const c=command();expect(isFreshRecordingCommand(c,c.issuedAtUnixMs)).toBe(true);
  expect(isFreshRecordingCommand(c,c.issuedAtUnixMs+RECORDING_COMMAND_TTL_MS+1)).toBe(false);
  expect(isFreshRecordingCommand(c,c.issuedAtUnixMs-5001)).toBe(false);
 });
 it('requires pairing and transports ordered starts and stops',async()=>{
  expect((await post('unknown',command())).status).toBe(404);
  const id=await session();const url=`${base}/api/recording?session=${id}`;
  expect(await (await fetch(url)).json()).toBeNull();
  const start=command();expect((await post(id,start)).status).toBe(200);
  expect(await (await fetch(url)).json()).toEqual(start);
  expect((await post(id,start)).status).toBe(409);
  const stop={...command(1),action:'stop'};expect((await post(id,stop)).status).toBe(200);
  expect(await (await fetch(url)).json()).toEqual(stop);
  expect((await post(id,command(0))).status).toBe(409);
  expect((await post(await session(),command(0))).status).toBe(200);
 });
 it('expires latest delivery without allowing a previously issued start to replay',async()=>{
  const now=Date.now(),clock=vi.spyOn(Date,'now').mockReturnValue(now);
  try{
   const id=await session();const c=command(4);expect((await post(id,c)).status).toBe(200);
   clock.mockReturnValue(now+RECORDING_COMMAND_TTL_MS+1);
   expect(await (await fetch(`${base}/api/recording?session=${id}`)).json()).toBeNull();
   expect((await post(id,{...command(3),issuedAtUnixMs:Date.now()})).status).toBe(409);
  }finally{clock.mockRestore();}
 });
 it('rejects stale commands, arbitrary payload fields, and oversized metadata',async()=>{
  const id=await session();
  for(const value of [{...command(),issuedAtUnixMs:Date.now()-16000},{...command(),rawVideo:'data'}, {...command(),id:'a'.repeat(3000)}])expect((await post(id,value)).status).toBe(400);
  expect(await (await fetch(`${base}/api/recording?session=${id}`)).json()).toBeNull();
 });
});
