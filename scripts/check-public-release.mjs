/** Audit the Git index, never print matched credential values. Not a complete secret scanner. */
import {execFileSync} from 'node:child_process';
const files=execFileSync('git',['ls-files','-z'],{encoding:'utf8'}).split('\0').filter(Boolean);
const problems=[];let bytes=0;
if(!files.length)problems.push('No tracked/staged files: stage the candidate release before checking.');
const forbidden=/(^|\/)(node_modules|artifacts|recordings|fireroom_trials|dist|build|\.aws|\.codex|\.agents)(\/|$)|(^|\/)\.env(?!\.example$)|\.(?:pem|key|p12|keystore|mp4|mov|log)$/i;
const privateFiles=new Set(['fireroom-pose-trials.json','platform/vega/src/hosted-target.ts','platform/vega/src/probe.ts','platform/vega/src/target.ts']);
const secretPatterns=[/-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/,/\b(?:AKIA|ASIA)[A-Z0-9]{16}\b/,/\bgh[pousr]_[A-Za-z0-9]{30,}\b/,/\bgithub_pat_[A-Za-z0-9_]{40,}\b/,/\bsk-proj-[A-Za-z0-9_-]{30,}\b/];
for(const file of files){
 if(forbidden.test(file)||privateFiles.has(file))problems.push(`Private/generated path staged: ${file}`);
 if(file.startsWith('docs/validation/')&&!file.endsWith('.md'))problems.push(`Raw validation attachment staged: ${file}`);
 const data=execFileSync('git',['show',`:${file}`],{maxBuffer:128*1024*1024});bytes+=data.length;
 if(data.length>=50*1024*1024)problems.push(`Large file: ${file}`);
 if(!data.includes(0)&&secretPatterns.some(pattern=>pattern.test(data.toString('utf8'))))problems.push(`Possible credential material in: ${file}`);
}
if(problems.length){console.error(problems.join('\n'));process.exitCode=1;}
else console.log(`PASS: ${files.length} indexed files, ${(bytes/1024/1024).toFixed(2)} MiB; no prohibited paths or configured credential signatures. Manual rights/privacy review still required.`);
