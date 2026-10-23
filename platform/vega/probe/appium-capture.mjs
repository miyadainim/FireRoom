import {writeFileSync} from 'node:fs';
const base='http://127.0.0.1:4723';
const request=async(path,method='GET',body)=>{const response=await fetch(base+path,{method,headers:{'Content-Type':'application/json'},body:body?JSON.stringify(body):undefined,signal:AbortSignal.timeout(45000)});return await response.json();};
let id;
try {
 const session=await request('/session','POST',{capabilities:{alwaysMatch:{platformName:'Kepler','appium:automationName':'automation-toolkit/JSON-RPC','kepler:device':'vda://emulator-5554'}}});
 writeFileSync('docs/validation/vega-gate/appium-session.json',JSON.stringify(session,null,2));
 id=session.value?.sessionId;if(!id)throw Error(JSON.stringify(session));
 const source=await request(`/session/${id}/source`);writeFileSync('docs/validation/vega-gate/appium-source.json',JSON.stringify(source,null,2));
 const capture=await request(`/session/${id}/screenshot`);if(typeof capture.value==='string'){writeFileSync('docs/validation/vega-gate/simulator.png',Buffer.from(capture.value,'base64'));console.log('Simulator screenshot saved');}else{writeFileSync('docs/validation/vega-gate/appium-screenshot-error.json',JSON.stringify(capture,null,2));console.log('Screenshot failed; diagnostic saved');}
} catch(e){console.error(String(e));process.exitCode=1;}finally{if(id)await request(`/session/${id}`,'DELETE').catch(()=>{});}
