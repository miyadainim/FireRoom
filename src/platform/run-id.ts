/** Correlation IDs only, never authentication/session credentials. Works on HTTP TV viewers. */
let counter=0;
export function createRunId():string {
 if(typeof globalThis.crypto?.randomUUID==='function')return globalThis.crypto.randomUUID();
 if(typeof globalThis.crypto?.getRandomValues==='function'){
  const bytes=globalThis.crypto.getRandomValues(new Uint8Array(16));bytes[6]=(bytes[6]&15)|64;bytes[8]=(bytes[8]&63)|128;
  const hex=Array.from(bytes,b=>b.toString(16).padStart(2,'0')).join('');return `${hex.slice(0,8)}-${hex.slice(8,12)}-${hex.slice(12,16)}-${hex.slice(16,20)}-${hex.slice(20)}`;
 }
 return `run-${Date.now().toString(36)}-${++counter}-${Math.random().toString(36).slice(2)}`;
}
