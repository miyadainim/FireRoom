import {describe,it,expect} from 'vitest';
import {constrainedDtw} from '../src/vision/dtw/align';
import type {DtwSample} from '../src/vision/dtw/types';
const samples=(values:number[]):DtwSample[]=>values.map((v,i)=>({timeMs:i*100,values:Array(6).fill(v),valid:Array(6).fill(true)}));
describe('global constrained DTW',()=>{
  it('aligns identical sequences with deterministic diagonal ties',()=>{
    const a=samples([0,1,2,1,0]);const result=constrainedDtw(a,a);
    expect(result.status).toBe('aligned');expect(result.distance).toBe(0);
    expect(result.path).toEqual([[0,0],[1,1],[2,2],[3,3],[4,4]]);
  });
  it('aligns uniform time expansion and reports mean RMS',()=>{
    const result=constrainedDtw(samples([0,1,2]),samples([0,0,1,1,2,2]),{bandRatio:.4});
    expect(result.status).toBe('aligned');expect(result.distance).toBe(0);
    const shifted=constrainedDtw(samples([0,1]),samples([2,3]),{bandRatio:0});expect(shifted.distance).toBe(2);
  });
  it('requires global endpoints and monotonic unit steps within band',()=>{
    const result=constrainedDtw(samples([0,1,2,3]),samples([0,1,1,2,3]),{bandRatio:.3});
    expect(result.path[0]).toEqual([0,0]);expect(result.path[result.path.length-1]).toEqual([3,4]);
    result.path.forEach(([i,j],k)=>{
      expect(Math.abs(i/3-j/4)).toBeLessThanOrEqual(.3+1e-12);
      if(k){const [pi,pj]=result.path[k-1];expect([[1,1],[1,0],[0,1]]).toContainEqual([i-pi,j-pj]);}
    });
  });
  it('rejects malformed inputs and nonfinite observed features',()=>{
    expect(constrainedDtw([],samples([0,1])).status).toBe('invalid');
    const a=samples([0,1]);a[1].timeMs=0;expect(constrainedDtw(a,a).status).toBe('invalid');
    const b=samples([0,1]);b[0].values[0]=NaN;expect(constrainedDtw(b,b).status).toBe('invalid');
    expect(constrainedDtw(samples([0,1]),samples([0,1]),{maxRun:0}).status).toBe('invalid');
    expect(constrainedDtw(samples([0,1]),samples([0,1]),{maxRun:9}).status).toBe('invalid');
    expect(constrainedDtw(samples(Array(241).fill(0)),samples([0,1])).status).toBe('invalid');
  });
  it('masks missing coordinates without treating missing evidence as zero distance',()=>{
    const a=samples([0,1]);a.forEach(s=>{s.values[0]=NaN;s.valid[0]=false;});
    expect(constrainedDtw(a,a).status).toBe('no-path');
    expect(constrainedDtw(a,a,{minSharedFeatures:5}).distance).toBe(0);
    expect(JSON.stringify(constrainedDtw(a,a))).not.toMatch(/Infinity|NaN/);
  });
  it('rejects a disconnected normalized band',()=>{
    expect(constrainedDtw(samples([0,1]),samples([0,1,2]),{bandRatio:0}).status).toBe('no-path');
  });
  it('bounds burst warping and preserves alternative run states',()=>{
    const a=samples([0,1]),b=samples([0,0,0,0,0,1]);
    const strict=constrainedDtw(a,b,{bandRatio:1,maxRun:1});expect(strict.status).toBe('no-path');
    const flexible=constrainedDtw(a,b,{bandRatio:1,maxRun:4});expect(flexible.status).toBe('aligned');expect(flexible.distance).toBe(0);
    const feasible=constrainedDtw(samples([0,0,0]),samples([0,0,0,0,0,0,0]),{bandRatio:1,maxRun:2});expect(feasible.status).toBe('aligned');
    let previous='',run=0;
    feasible.path.slice(1).forEach(([i,j],k)=>{const [pi,pj]=feasible.path[k];const move=i===pi?'h':j===pj?'v':'d';run=move===previous?run+1:1;previous=move;if(move!=='d')expect(run).toBeLessThanOrEqual(2);});
  });
});
