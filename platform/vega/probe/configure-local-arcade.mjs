// Simulator development only. Uses the verified Vega simulator host gateway; no VDA reverse required.
import {readFileSync,writeFileSync} from 'node:fs';
const phoneOrigin=process.argv[2];const phone=new URL(phoneOrigin);
if(phone.protocol!=='https:'||phone.username||phone.password||['localhost','127.0.0.1','[::1]'].includes(phone.hostname))throw Error('Phone-reachable HTTPS origin required');
const viewer=new URL('http://10.0.2.2:5173/arcade.html');
const setup=`(()=>{if(document.querySelector('#app')?.dataset.activePairing==='true')return;document.querySelector('#setup')?.click();fetch('/__fireroom/pairing').then(r=>r.json()).then(data=>{const origin=document.querySelector('#origin');if(origin)origin.value=data.phoneOrigins?.[0]||${JSON.stringify(phone.origin)};document.querySelector('#pair')?.click();}).catch(()=>{const origin=document.querySelector('#origin');if(origin)origin.value=${JSON.stringify(phone.origin)};document.querySelector('#pair')?.click();});})();`;
writeFileSync('platform/vega/src/hosted-target.ts',`// Generated simulator-local Arcade target; no public hosting or controller credentials.\nexport const hostedOrigin=${JSON.stringify(viewer.href)};\nexport const hostedMonitor=${JSON.stringify(readFileSync('platform/vega/probe/hosted-monitor.js','utf8'))};\nexport const hostedSetup=${JSON.stringify(setup)};\n`);
