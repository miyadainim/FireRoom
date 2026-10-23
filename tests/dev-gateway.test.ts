import {describe,it,expect} from 'vitest';
import {createServer,type Server} from 'node:http';
import {mkdtemp,writeFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';import {join} from 'node:path';
import {createGateway} from '../scripts/dev-gateway.ts';
const token='controller-test-only',session='a'.repeat(32);
const listen=(s:Server)=>new Promise<string>(r=>s.listen(0,'127.0.0.1',()=>{const a=s.address();r(`http://127.0.0.1:${typeof a==='object'&&a?a.port:0}`);}));
const close=(s:Server)=>new Promise<void>(r=>{s.close(()=>r());s.closeAllConnections();});
describe('restricted integration gateway',()=>{
 it('protects provisioning and proxies only paired bounded requests without serving source',async()=>{
 const root=await mkdtemp(join(tmpdir(),'fr-gateway-'));await writeFile(join(root,'index.html'),'app');let forwards=0;
 const backend=createServer((req,res)=>{forwards++;res.setHeader('Content-Type','application/json');res.end(req.url==='/api/session'?JSON.stringify({sessionId:session}):'null');});const relay=await listen(backend);
 const gateway=createGateway({root,controllerToken:token,relayOrigin:relay});const origin=await listen(gateway);
 try{
  expect((await fetch(origin+'/api/session',{method:'POST'})).status).toBe(403);expect(forwards).toBe(0);
  const created=await fetch(origin+'/api/session',{method:'POST',headers:{'x-fireroom-controller':token}});expect(created.status).toBe(200);expect(created.headers.get('set-cookie')).toContain('Secure; HttpOnly; SameSite=Strict');
  expect((await fetch(origin+'/api/frame?session=wrong')).status).toBe(403);
  expect((await fetch(origin+`/api/frame?session=${session}&session=${session}`)).status).toBe(403);
  const frame=await fetch(origin+`/api/frame?session=${session}`);expect(await frame.json()).toBe(null);expect(frame.headers.get('referrer-policy')).toBe('no-referrer');expect(frame.headers.get('access-control-allow-origin')).toBe(null);
  expect((await fetch(origin+`/api/recording?session=${session}`,{method:'POST',body:'{}'})).status).toBe(403);
  const count=forwards;expect((await fetch(origin+`/api/frame?session=${session}`,{method:'POST',body:'x'.repeat(20001)})).status).toBe(413);expect(forwards).toBe(count);
  expect((await fetch(origin+'/api/other')).status).toBe(404);expect((await fetch(origin+'/.env')).status).toBe(404);expect((await fetch(origin+'/src/main.ts')).status).toBe(404);
  expect((await fetch(origin+'/api/session',{method:'POST',headers:{'x-fireroom-controller':token,origin:'https://evil.example'}})).status).toBe(403);
  expect(await (await fetch(origin+'/')).text()).toBe('app');
 }finally{await close(gateway);await close(backend);await rm(root,{recursive:true,force:true});}
 });
});
