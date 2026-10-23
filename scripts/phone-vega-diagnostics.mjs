/** Local-only runtime controller provisioning and aggregate Vega diagnostics; never public. */
import http from 'node:http';import {readFileSync,appendFileSync,mkdirSync} from 'node:fs';
mkdirSync('docs/validation/phone-vega',{recursive:true});
http.createServer((req,res)=>{
 res.setHeader('Cache-Control','no-store');
 if(req.method==='GET'&&req.url==='/controller'){
  try{
   const token=readFileSync('artifacts/phone-vega/controller-token.txt','utf8').trim();
   if(!token)throw Error('Controller unavailable');
   res.writeHead(200,{'Content-Type':'application/json'});res.end(JSON.stringify({token}));
  }catch{
   res.writeHead(503,{'Content-Type':'application/json'});res.end(JSON.stringify({error:'Controller authorization unavailable; start the gateway first'}));
  }
  return;
 }
 if(req.method!=='POST'||req.url!=='/'){res.writeHead(404);res.end();return;}
 let body='';req.on('data',c=>{body+=c;if(body.length>100000)req.destroy();});req.on('end',()=>{try{const value=JSON.parse(body);appendFileSync('docs/validation/phone-vega/vega-events.jsonl',JSON.stringify({at:new Date().toISOString(),event:value})+'\n');res.writeHead(204);res.end();}catch{res.writeHead(400);res.end();}});
}).listen(9137,'127.0.0.1',()=>console.log('Local runtime provisioning/diagnostics ready on127.0.0.1:9137'));
