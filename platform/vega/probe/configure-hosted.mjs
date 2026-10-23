import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
const origin=process.argv[2];if(!origin||new URL(origin).protocol!=='https:')throw Error('Trusted HTTPS origin required');
mkdirSync('artifacts/phone-vega',{recursive:true});
writeFileSync('artifacts/phone-vega/origin.txt',new URL('/?poseModel=full',origin).href);
writeFileSync('platform/vega/src/hosted-target.ts',`// Test settings only. Controller authorization is provisioned at runtime over loopback.\nexport const hostedOrigin = ${JSON.stringify(new URL('/?poseModel=full',origin).href)};\nexport const hostedMonitor = ${JSON.stringify(readFileSync('platform/vega/probe/hosted-monitor.js','utf8'))};\nexport const hostedSetup = ${JSON.stringify(readFileSync('platform/vega/probe/hosted-setup.js','utf8'))};\n`);
