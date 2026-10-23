import {describe,it,expect} from 'vitest';
import {samplePromptReference,sampleReference,type PromptExercise,type PromptStance} from '../src/graphics/scene';

describe('single-punch form demonstration',()=>{
 for(const [exercise,stance,hand] of [
  ['jab','orthodox','left'],['cross','orthodox','right'],
  ['jab','southpaw','right'],['cross','southpaw','left']
 ] as const){
  it(`demonstrates ${stance} ${exercise} with anatomical ${hand} hand only`,()=>{
   const peak=samplePromptReference(499,exercise,stance);
   expect(peak.hand).toBe(hand);
   expect(peak[`${hand}Extension`]).toBeGreaterThan(.99);
   for(let t=0;t<1000;t+=10){
    const sample=samplePromptReference(t,exercise,stance);
    expect(sample[hand==='left'?'rightExtension':'leftExtension']).toBe(0);
   }
   expect(samplePromptReference(850,exercise,stance)[`${hand}Extension`]).toBe(0);
   expect(samplePromptReference(1000,exercise,stance)).toMatchObject({phase:'complete',hand:null,leftExtension:0,rightExtension:0});
  });
 }
 it('retains original orthodox jab guide timing and clamps invalid time',()=>{
  for(const t of [-10,0,200,499,500,849,1000,NaN]){
   expect(samplePromptReference(t,'jab','orthodox')).toEqual(sampleReference(t,'jab'));
  }
 });
 it('never follows a single prompt with another punch',()=>{
  for(const exercise of ['jab','cross'] as PromptExercise[])for(const stance of ['orthodox','southpaw'] as PromptStance[]){
   expect(samplePromptReference(1499,exercise,stance).phase).toBe('complete');
  }
 });
 it.each(['orthodox','southpaw'] as const)('demonstrates anatomical lead then rear combo for %s',stance=>{const lead=stance==='orthodox'?'left':'right',rear=lead==='left'?'right':'left';expect(samplePromptReference(499,'jab-cross',stance)).toMatchObject({hand:lead,[`${lead}Extension`]:expect.any(Number),[`${rear}Extension`]:0});expect(samplePromptReference(499,'jab-cross',stance)[`${lead}Extension`]).toBeGreaterThan(.99);expect(samplePromptReference(1499,'jab-cross',stance).hand).toBe(rear);expect(samplePromptReference(1499,'jab-cross',stance)[`${rear}Extension`]).toBeGreaterThan(.99);expect(samplePromptReference(2000,'jab-cross',stance)).toMatchObject({phase:'complete',hand:null,leftExtension:0,rightExtension:0});});

});
