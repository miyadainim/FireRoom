# V2 trial replay — 2026-10-15

Input: fireroom_trials/fireroom-pose-trials v2.json. User confirms trial1 left hand, trial2 right hand. Both saved labels remainjab/orthodox; original unchanged. Export's active geometryMode isimage-3d for both trials, notworld-3d. All three export comparisons report0events.

Replayed unchanged production recognizers using scripts/analyze-poses.ts with explicit image-3d andworld-3d modes. Trial1:86frames,70world arrays,7.10sec. Trial2:98frames,89world arrays,8.74sec. Missing world arrays correspond to explicitlost tracking and do not imply fabricated world data.

| Mode and intended arm | Established guard frames (independent guard replay) | Phase in recognizer | Max usable extension | Events |
|---|---:|---|---:|---:|
|imageXYZ trial1 left|0|idle68 frames|0.973|0|
|imageXYZ trial2 right|0|idle77 frames|0.993|0|
|worldXYZ trial1 left|53|guard59,idle9|0.983|0|
|worldXYZ trial2 right|51|guard62,idle15|0.999|0|

No valid frame satisfies all five extension predicates simultaneously. World trial1 high-extension samples are at0.81–0.96sec, before arming, with wrist estimated1.29–1.42 shoulder spans below shoulder and travel origin absent. World trial2 has early unarmed high-extension samples and later samples around7.25–7.40sec with armed/travel/straightness allpassing but heightfailing: wrist0.98–1.55 shoulder spans below shoulder, versus allowable0.25. Later high-extension samples lose arming after resets. No accepted extension means no recovery-confirmed event.

Trial1 has16lost+1low-confidence frames and1unreliable face-anchor sample. Trial2 has9lost+11low-confidence,1unreliableface, and a>350ms frame gap reset. Reset criteria and pose-estimation uncertainties must remain distinct from actual technique quality. No video provides ground truth on actual form/timing.

Software rules unchanged. Detector fails supplied labeled cases; no claim of physical recognition improvement. Scoring world mode changes active lesson feedback but does not by itself fix these recorded trajectories. Future labeled capture should hold guard first, perform once, recover before stopping; inspect the world height/straightness/travel at the actual intended punch. Do not relax height simply to count ending arm-lowering movements. Current orthodox mapping expectsjab forleft andcross forright, so labels need correction in future evaluation or an explicit user-intent sidecar, not silent mutation.
