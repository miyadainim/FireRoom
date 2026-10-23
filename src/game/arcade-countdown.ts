/** Active-time countdown: brief uncertainty freezes it; sustained loss cancels it. */
export class ArcadeCountdown {
 constructor(private readonly continuousGuard=false){}
 private elapsed=0;private previous:number|null=null;private lostAt:number|null=null;
 start(now:number){this.elapsed=0;this.previous=now;this.lostAt=null;}
 cancel(){this.previous=null;this.lostAt=null;}
 active(){return this.previous!==null;}
 seconds(){return Math.max(1,3-Math.floor(this.elapsed/1000));}
 tick(now:number,ready:boolean):boolean {
  if(this.previous===null||now<this.previous)return false;
  const delta=now-this.previous;this.previous=now;
  if(delta>1000){this.cancel();return false;}
  if(!ready){if(this.continuousGuard){this.cancel();return false;}this.lostAt??=now;if(now-this.lostAt>=750)this.cancel();return false;}
  if(this.lostAt!==null){const gap=now-this.lostAt;this.lostAt=null;if(gap>=750)this.cancel();return false;}
  this.elapsed+=delta;
  if(this.elapsed<3000)return false;
  this.cancel();return true;
 }
}
