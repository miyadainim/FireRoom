/** Build a phone URL without carrying viewer query/hash state into the companion. */
export function phonePairingUrl(origin:string,sessionId:string,model?:'lite'|'full'):string {
 const url=new URL(origin);
 if(url.protocol!=='https:')throw new Error('Open FireRoom over HTTPS before pairing your phone.');
 if(['localhost','127.0.0.1','[::1]'].includes(url.hostname))throw new Error('Use the computer LAN address for phone pairing.');
 if(url.username||url.password)throw new Error('Phone address must not contain credentials.');
 url.pathname='/';url.search='';url.hash='';url.searchParams.set('phone',sessionId);if(model==='full')url.searchParams.set('poseModel','full');return url.href;
}
