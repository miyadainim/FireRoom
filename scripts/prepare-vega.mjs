// Generate safe compile-time defaults without publishing local origins or probe bundles.
import {existsSync,writeFileSync} from 'node:fs';
const defaults={
 'platform/vega/src/probe.ts':'export const probeScript = "";\n',
 'platform/vega/src/target.ts':'export const displayMode = false;\nexport const sceneMonitor = "";\nexport const sceneActions = "";\n',
 'platform/vega/src/hosted-target.ts':'export const hostedOrigin = "https://example.invalid/";\nexport const hostedMonitor = "";\nexport const hostedSetup = "";\n',
};
for(const[path,content]of Object.entries(defaults))if(!existsSync(path))writeFileSync(path,content);
console.log('Vega compile defaults ready. Configure a real hosted or simulator-local target before launching.');
