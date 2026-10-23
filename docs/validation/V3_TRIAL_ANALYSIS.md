# V3 mode verification and replay — 2026-10-15

Input fireroom_trials/fireroom-pose-trials v3.json unchanged. Both trial geometryMode fields and selected result mode areworld-3d; all145 frames (72+73) contain33world landmarks. The user's selection is correct; do not ask them to keep switching modes.

Unchanged recognizer replay reproduces0events. Independent GuardEstimator establishes left/right guard30/40frames in trial1 and49/44frames in trial2. Trial1 has8lowconfidence observations; trial2 has none, so lowconfidence is not the sole cause.

All valid samples whose extension exceeds0.92 fail the wrist-height gate. Early samples additionally precede armed guard. Near trial1 end, both arms pass arming/departure/travel/straightness and fail only height (left5.40–5.95sec;right5.33–5.95sec). Trial2 similarly has late height-failed straightened positions (right5.51–5.98sec,left5.66–5.98sec). These are estimates at boundaries, not independently labeled punch instants; could represent lowering arms. No accepted extension phase or recovered punch is emitted. Removing height alone could count an end-of-trial arm-lowering action and would not prove the actual intended punch was recognized. No thresholds or production behavior changed.

Conclusion: world capture/scoring selection verified; supplied case recognitionFAIL0/2. Exact timing/form of intended punches cannot be established without an explicit timed action label or video; physical accuracy remainsNOT VERIFIED. Follow-up should keep WorldXYZ and identify attempted punch interval within the trial, with guard held before/after; debug world angle/travel at that interval rather than treating every straightened boundary pose as a punch.

## User timing clarification: attempted punches near the middle

User confirms intended punches occurred near the middle, not at the recording boundaries. Analyzed central third (approximately1.98–3.98sec) separately, preserving trial1left/trial2right intent from previous context.

- Trial1left: maximum world extension0.8393 at3.012sec; elbow113.59degrees; armed/outsideGuard/travel pass, travel0.891shoulderspans, but straightness>0.92 fails and wristheight0.519 fails allowable0.25. Across central24usableframes leftguard established14; wristheight fails only3. Rightarm maxcentralextension0.739.
- Trial2right: maximum worldextension0.84645 at2.875sec; elbow115.65degrees; armed/outsideGuard/height pass, but straightness fails and travel0.083 fails atthatpeak. Travel peaks0.753elsewhere, so movementexists but doesnotcoincide with allrequiredpredicates. All24centralusableframes passheight; rightguard established15. Leftarm maxcentralextension0.777.

Revised interpretation: finishing-posture height failures do not explain the actual central punch attempts alone. The common blocker is estimated straightness below0.92. Trial2 especially isnot blocked byheight duringtheintendedwindow. Model-estimated elbow angles remain around114–116degrees at peak; no actualanatomicalangle is verified. Thecurrentguard origin refresh while m.guard remains true can also absorb early outward travel, which merits targeted analysis rather than indiscriminate threshold lowering. No productionthresholds changed. Relative elbowopening/travel/recovery detection should be evaluated against labeled non-punch negatives before replacing absolutefull-extension gating.
