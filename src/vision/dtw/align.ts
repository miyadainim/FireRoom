import type {AlignmentOptions,AlignmentResult,DtwSample} from './types';

/** Global masked DTW. Clock intervals are not a form/timing score. */
export function constrainedDtw(attempt:DtwSample[],reference:DtwSample[],options:Partial<AlignmentOptions>={}):AlignmentResult {
  const fail=(status:'invalid'|'no-path',reason:string):AlignmentResult=>({status,distance:null,path:[],reason});
  const {bandRatio=.2,maxRun=2,minSharedFeatures=6}=options;
  if(!Number.isFinite(bandRatio)||bandRatio<0||bandRatio>1||!Number.isInteger(maxRun)||maxRun<1||maxRun>8||!Number.isInteger(minSharedFeatures)||minSharedFeatures<1||minSharedFeatures>128) return fail('invalid','Invalid alignment options');
  if(!Array.isArray(attempt)||!Array.isArray(reference)) return fail('invalid','Samples must be arrays');
  const dims=attempt[0]?.values?.length;
  if(!Number.isInteger(dims)||dims<1||dims>128) return fail('invalid','Feature dimension must be 1–128');
  for(const samples of [attempt,reference]) {
    if(samples.length<2||samples.length>240) return fail('invalid','Each sequence requires 2–240 samples');
    let previous=-Infinity;
    for(const sample of samples) {
      if(!sample||!Number.isFinite(sample.timeMs)||sample.timeMs<=previous||!Array.isArray(sample.values)||!Array.isArray(sample.valid)||sample.values.length!==dims||sample.valid.length!==dims) return fail('invalid','Invalid dimensions or non-increasing timestamps');
      previous=sample.timeMs;
      for(let k=0;k<dims;k++) if(typeof sample.valid[k]!=='boolean'||(sample.valid[k]&&!Number.isFinite(sample.values[k]))) return fail('invalid','Valid features must be finite and masks boolean');
    }
  }
  const n=attempt.length,m=reference.length,states=1+2*maxRun;
  // Retain every run state: a locally cheaper long run must not discard a
  // shorter run that can still reach the global endpoint.
  const size=n*m*states,cost=new Float64Array(size).fill(Infinity),parent=new Int32Array(size).fill(-1);
  const index=(i:number,j:number,s:number)=>(i*m+j)*states+s;
  const local=new Float64Array(n*m).fill(Infinity);
  for(let i=0;i<n;i++) for(let j=0;j<m;j++) {
    if(Math.abs(i/(n-1)-j/(m-1))>bandRatio+1e-12) continue;
    let norm=0,count=0;
    for(let k=0;k<dims;k++) if(attempt[i].valid[k]&&reference[j].valid[k]) {count++;norm=Math.hypot(norm,attempt[i].values[k]-reference[j].values[k]);}
    if(count<minSharedFeatures||!Number.isFinite(norm)) continue;
    const d=norm/Math.sqrt(count);local[i*m+j]=d;
    if(i===0&&j===0) {cost[0]=d;continue;}
    const relax=(s:number,pi:number,pj:number,ps:number)=>{
      const p=index(pi,pj,ps),q=index(i,j,s),candidate=cost[p]+d;
      // Strict comparison gives stable state-order tie handling.
      if(candidate<cost[q]) {cost[q]=candidate;parent[q]=p;}
    };
    if(i>0&&j>0) for(let s=0;s<states;s++) relax(0,i-1,j-1,s);
    if(j>0) {
      relax(1,i,j-1,0);
      for(let s=maxRun+1;s<states;s++) relax(1,i,j-1,s);
      for(let run=2;run<=maxRun;run++) relax(run,i,j-1,run-1);
    }
    if(i>0) {
      relax(maxRun+1,i-1,j,0);
      for(let s=1;s<=maxRun;s++) relax(maxRun+1,i-1,j,s);
      for(let run=2;run<=maxRun;run++) relax(maxRun+run,i-1,j,maxRun+run-1);
    }
  }
  let end=-1,best=Infinity;
  for(let s=0;s<states;s++) {const q=index(n-1,m-1,s);if(cost[q]<best){best=cost[q];end=q;}}
  if(end<0) return fail('no-path','No finite path satisfies masks, band and run constraints');
  const path:[number,number][]=[];
  for(let q=end;q>=0;q=parent[q]) {const cell=Math.floor(q/states);path.push([Math.floor(cell/m),cell%m]);}
  path.reverse();
  const distance=path.reduce((sum,[i,j])=>sum+local[i*m+j]/path.length,0);
  if(!Number.isFinite(distance)) return fail('no-path','Alignment distance overflow');
  return {status:'aligned',distance,path,reason:'Global constrained alignment; distance is mean local RMS feature deviation'};
}
