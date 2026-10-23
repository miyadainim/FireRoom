// Local-only native-wrapper diagnostics. No camera/video/relay data.
import http from 'node:http';
import {appendFileSync,writeFileSync} from 'node:fs';
const output = new URL('../../../docs/validation/vega-gate/probe-events.jsonl', import.meta.url);
http.createServer((req,res)=>{
 let body=''; req.on('data',chunk=>{body+=chunk;if(body.length>2097152)req.destroy();});
 req.on('end',()=>{try{const event=JSON.parse(body);if(event.message){const data=JSON.parse(event.message);if(typeof data.canvasPng==='string' && data.canvasPng.startsWith('data:image/png;base64,')){const label=typeof data.captureLabel==='string'&&/^[a-z-]+$/.test(data.captureLabel)?data.captureLabel:'webgl-canvas';writeFileSync(new URL('../../../docs/validation/vega-gate/'+label+'.png',import.meta.url),Buffer.from(data.canvasPng.split(',')[1],'base64'));event.message=JSON.stringify({canvasCapture:label+'.png',ghostLabel:data.ghostLabel});}}appendFileSync(output,JSON.stringify({receivedAt:new Date().toISOString(),event})+'\n');res.writeHead(204);res.end();}catch{res.writeHead(400);res.end();}});
}).listen(9137,'127.0.0.1',()=>console.log('Probe diagnostics on loopback:9137'));
