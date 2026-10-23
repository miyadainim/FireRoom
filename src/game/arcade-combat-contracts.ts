/** Versioned Arcade-only assessment; no changes to PoseFrame/PunchEvent or Coach evaluation. */
export type Criterion='PASS'|'FAIL'|'UNKNOWN';
export interface ArcadeTechnique {
 schemaVersion:1;punchId:string;type:'jab'|'cross';startingGuard:Criterion;oppositeGuard:Criterion;recovery:Criterion;
 /** Producer clock used only for correlating evidence, never game elapsed time. */
 completedAtMs:number;reason:string;
}
export type CombatPhase='FIGHTING'|'FINISHER_INTRO'|'FINISHER_READY'|'FINISHER_IMPACT'|'KNOCKOUT_ANIMATION'|'RESULTS';
export const ARCADE_BALANCE={jab:10,cross:14,startingGuard:.10,oppositeGuard:.20,recovery:.20,sequence:.30,sequenceWindowMs:1500,comboWindowMs:2000,techniqueTimeoutMs:2500,finisherIntroMs:900,finisherReadyMs:10000,finisherImpactMs:140,knockoutMs:1800} as const;
