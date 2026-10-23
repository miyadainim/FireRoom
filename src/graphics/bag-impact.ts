/** Authored gameplay amplitudes, never inferred force/contact location. */
export function sampleVirtualBagReaction(elapsedMs:number,type:'jab'|'cross'){
 if(!Number.isFinite(elapsedMs)||elapsedMs<0||elapsedMs>=2600)return {rotationX:0,backwardOffset:0};
 const sway=Math.sin(elapsedMs/110)*Math.exp(-elapsedMs/480),strength=type==='jab'?1:1.25;
 return {rotationX:.095*strength*sway,backwardOffset:-.045*strength*sway};
}
