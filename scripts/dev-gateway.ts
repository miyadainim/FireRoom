/** Temporary integration gateway: static dist + limited relay routes; both listeners stay loopback. */
import {createServer,type IncomingMessage,type ServerResponse} from 'node:http';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {resolve,sep,extname} from 'node:path';
import {randomBytes} from 'node:crypto';
export function createGateway(options:{root:string;controllerToken:string;relayOrigin?:string;onEvent?:(event:Record<string,unknown>)=>void}){
 const root=resolve(options.root),sessions=new Set<string>();
 const relay=options.relayOrigin??'http://127.0.0.1:8787';
 const upstream=new URL(relay);if(upstream.protocol!=='http:'||upstream.hostname!=='127.0.0.1')throw Error('Relay must remain on loopback');
 const event=options.onEvent??(()=>{});
 return createServer(async(req:IncomingMessage,res:ServerResponse)=>{
  res.setHeader('Cache-Control','no-store');res.setHeader('Referrer-Policy','no-referrer');res.setHeader('X-Content-Type-Options','nosniff');res.setHeader('Permissions-Policy','camera=(self), microphone=()');
  const reply=(status:number,text:string)=>{res.writeHead(status,{'Content-Type':'application/json'});res.end(JSON.stringify({error:text}));};
  try{
   const url=new URL(req.url??'/','http://localhost');
   const controller=req.headers['x-fireroom-controller']===options.controllerToken||(req.headers.cookie??'').split(';').some(c=>c.trim()===`fr_controller=${options.controllerToken}`);
   if(req.headers['x-fireroom-controller']===options.controllerToken)res.setHeader('Set-Cookie',`fr_controller=${options.controllerToken}; Secure; HttpOnly; SameSite=Strict; Path=/`);
   if(url.pathname.startsWith('/api/')){
    const method=req.method??'GET';
    const create=url.pathname==='/api/session'&&method==='POST';
    if(!create&&!['/api/frame','/api/recording'].includes(url.pathname)){reply(404,'Unknown API route');return;}
    if(!['GET','POST'].includes(method)){reply(405,'Method not allowed');return;}
    if(create&&!controller){reply(403,'Controller authorization required');return;}
    const keys=url.searchParams.getAll('session');const session=keys[0];
    if(!create&&(keys.length!==1||!session||!sessions.has(session))){reply(403,'Unpaired session');return;}
    if(url.pathname==='/api/recording'&&method==='POST'&&!controller){reply(403,'Controller authorization required');return;}
    const origin=req.headers.origin;if(method==='POST'&&origin&&origin!==`https://${req.headers.host}`){reply(403,'Origin mismatch');return;}
    let body:Buffer|undefined;
    if(method==='POST'){
     const chunks:Buffer[]=[];let size=0;const max=url.pathname==='/api/recording'?2048:create?0:20000;
     for await(const c of req){const b=Buffer.from(c);size+=b.length;if(size>max){reply(413,'Body too large');return;}chunks.push(b);}body=Buffer.concat(chunks);
    }
    if(method==='POST'&&url.pathname==='/api/frame'&&body){let value;try{value=JSON.parse(body.toString());}catch{reply(400,'Invalid pose JSON');return;}const allowed=['schemaVersion','sessionId','sequence','timestampMs','stance','mirrored','tracking','landmarks','worldLandmarks','imageSize','cameraConfigurationId'];if(!value||typeof value!=='object'||Array.isArray(value)||Object.keys(value).some(k=>!allowed.includes(k))){reply(400,'Unexpected pose fields');return;}}
    const response=await fetch(relay+url.pathname+url.search,{method,body:body?.toString(),headers:body?{'Content-Type':'application/json'}:undefined,signal:AbortSignal.timeout(5000)});
    const text=await response.text();
    if(create&&response.ok){const data=JSON.parse(text);if(typeof data.sessionId!=='string'||!/^[a-f0-9]{32}$/.test(data.sessionId))throw Error('Invalid relay session');sessions.add(data.sessionId);event({type:'session-created'});}
    if(method==='POST'&&url.pathname==='/api/frame'&&response.ok&&body){const f=JSON.parse(body.toString());event({type:'phone-frame',sequence:f.sequence,tracking:f.tracking,landmarks:f.landmarks?.length,worldLandmarks:f.worldLandmarks?.length,cameraConfigurationId:f.cameraConfigurationId,imageSize:f.imageSize});}
    if(!response.ok)event({type:'api-error',path:url.pathname,status:response.status});
    res.writeHead(response.status,{'Content-Type':'application/json'});res.end(text);return;
   }
   if(!['GET','HEAD'].includes(req.method??'')){reply(405,'Method not allowed');return;}
   let path:string;try{path=decodeURIComponent(url.pathname);}catch{reply(400,'Invalid path');return;}
   if(path.split('/').some(p=>p.startsWith('.')||p.includes('\\'))){reply(404,'Not found');return;}
   const file=resolve(root,'.'+(path==='/'?'/index.html':path));
   if(!file.startsWith(root+sep)){reply(404,'Not found');return;}
   const data=await readFile(file).catch(()=>null);if(!data){reply(404,'Not found');return;}
   const mime:Record<string,string>={'.html':'text/html; charset=utf-8','.js':'text/javascript','.css':'text/css','.wasm':'application/wasm','.png':'image/png','.svg':'image/svg+xml','.json':'application/json'};
   res.writeHead(200,{'Content-Type':mime[extname(file)]??'application/octet-stream'});res.end(req.method==='HEAD'?undefined:data);
  }catch(error){event({type:'gateway-error',error:error instanceof Error?error.message:'Unknown error'});if(!res.headersSent)reply(502,'Backend unavailable');else res.end();}
 });
}
if(process.argv[1]&&resolve(process.argv[1])===new URL(import.meta.url).pathname){
 const dir=resolve('artifacts/phone-vega');await mkdir(dir,{recursive:true});const token=randomBytes(32).toString('hex');await writeFile(resolve(dir,'controller-token.txt'),token,{mode:0o600});
 const log=(event:Record<string,unknown>)=>{process.stdout.write(JSON.stringify({at:new Date().toISOString(),...event})+'\n');};
 createGateway({root:'dist',controllerToken:token,onEvent:log}).listen(8790,'127.0.0.1',()=>console.log('Gateway listening on127.0.0.1:8790; controller token saved privately.'));
}
