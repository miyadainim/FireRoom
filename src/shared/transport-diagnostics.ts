/** Relative durations stay on their own device clock; never subtract phone and TV clocks. */
export interface TransportTiming {id:number;kind:'upload'|'inference'|'camera-gap';atMs:number;durationMs:number;sequence:number;count:number;status:number}
export function isTransportTimings(value:unknown):value is TransportTiming[]{
 return Array.isArray(value)&&value.length<=24&&value.every(v=>v&&typeof v==='object'&&Object.keys(v).every(k=>['id','kind','atMs','durationMs','sequence','count','status'].includes(k))&&['upload','inference','camera-gap'].includes(v.kind)&&['id','atMs','durationMs','sequence','count','status'].every(k=>typeof v[k]==='number'&&Number.isFinite(v[k])&&v[k]>=0)&&Number.isSafeInteger(v.id)&&Number.isSafeInteger(v.sequence));
}
