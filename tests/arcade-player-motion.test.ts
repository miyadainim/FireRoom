import {describe,it,expect} from 'vitest';
import {ArcadePlayerMotion} from '../src/graphics/arcade-player-motion';
describe('independent authored Arcade gloves',()=>{
 it.each([['left','right'],['right','left']] as const)('keeps %s jab recovery visible while %s cross begins', (lead,rear)=>{
  const motion=new ArcadePlayerMotion();motion.start(lead,'jab',0);const recovering=motion.extension(lead,240);expect(recovering).toBeGreaterThan(0);
  motion.start(rear,'cross',240);expect(motion.extension(lead,240)).toBe(recovering);
  expect(motion.extension(lead,270)).toBeGreaterThan(0);expect(motion.extension(rear,270)).toBeGreaterThan(0);
  expect(motion.extension(lead,300)).toBe(0);expect(motion.extension(rear,420)).toBeCloseTo(1);expect(motion.extension(rear,600)).toBe(0);
 });
 it('rests before a start and after recovery, with bounded finite extension',()=>{
  const m=new ArcadePlayerMotion();expect(m.extension('left',50)).toBe(0);m.start('left','jab',100);
  expect(m.extension('left',99)).toBe(0);expect(m.extension('left',NaN)).toBe(0);
  for(let t=100;t<=500;t+=10){expect(m.extension('left',t)).toBeGreaterThanOrEqual(0);expect(m.extension('left',t)).toBeLessThanOrEqual(1);}
 });
});
