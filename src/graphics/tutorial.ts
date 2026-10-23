import type {Stance} from '../shared/contracts';

export const GUARD_HOLD_MS=3000;
// 200ms ready + 650ms rise + 3s fully raised + existing 200ms fade-out.
export const GUARD_REFERENCE_DURATION_MS=850+GUARD_HOLD_MS+200;
/** Authored visual guide only. Both anatomical hands return to the existing guard. */
export function sampleGuardReference(elapsedMs:number) {
 const time=Math.max(0,Number.isFinite(elapsedMs)?elapsedMs:0);
 const t=Math.min(1,Math.max(0,(time-200)/650));
 const rise=t*t*(3-2*t);
 return {timestampMs:time,phase:time>=GUARD_REFERENCE_DURATION_MS?'complete':time<200?'ready':time<850?'raise':'hold',loweringOffset:.19*(1-rise),leftExtension:0,rightExtension:0} as const;
}

/** Static, first-person anatomical left/right schematic; never camera measurement. */
export function stanceIllustration(stance:Stance):string {
 const orthodox=stance!=='southpaw';
 const lead=orthodox?'Left':'Right',rear=orthodox?'Right':'Left';
 const leftY=orthodox?45:105,rightY=orthodox?105:45;
 return `<svg class="stance-illustration" viewBox="0 0 440 210" role="img" aria-label="${orthodox?'Orthodox':'Southpaw'} stance: ${lead.toLowerCase()} foot leads, ${rear.toLowerCase()} foot behind. Teaching diagram, self-check only." style="display:block;width:min(100%,440px);max-height:210px;margin:auto">
 <rect x="1" y="1" width="438" height="208" rx="18" fill="#fff4d7" stroke="#23344d" stroke-width="2"/>
 <text x="220" y="25" text-anchor="middle" fill="#23344d" font-size="16" font-family="sans-serif">FACE THE BAG ↑</text>
 <path d="M220 50V153" stroke="#b5a78b" stroke-width="2" stroke-dasharray="6 7"/>
 <ellipse cx="150" cy="${leftY+22}" rx="22" ry="34" fill="${orthodox?'#b94738':'#3b6281'}" transform="rotate(-9 150 ${leftY+22})"/>
 <ellipse cx="290" cy="${rightY+22}" rx="22" ry="34" fill="${orthodox?'#3b6281':'#b94738'}" transform="rotate(9 290 ${rightY+22})"/>
 <text x="86" y="${leftY+22}" text-anchor="middle" fill="#23344d" font-size="18" font-family="sans-serif">Left</text>
 <text x="354" y="${rightY+22}" text-anchor="middle" fill="#23344d" font-size="18" font-family="sans-serif">Right</text>
 <text x="220" y="181" text-anchor="middle" fill="#23344d" font-size="17" font-family="sans-serif">${lead} leads · ${rear} behind</text>
 <text x="220" y="200" text-anchor="middle" fill="#5a5d62" font-size="13" font-family="sans-serif">Your view · illustration only · confirm your own setup</text>
 </svg>`;
}
