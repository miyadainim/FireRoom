# Human camera validation required

Do not interpret synthetic fixtures or unlabeled replay counts as physical success. Use Full with the known front-low setup. Preserve raw videos and pose exports, avoid forceful locked elbows, and perform ordinary controlled movements.

Record and independently review:20jabs,20crosses,20non-punch actions (guard readjustments, idle, deliberate reaches), plus short punches, feints, elbow occlusion, wrist tracking loss and changes of camera/body position. Include jab-cross and cross-jab. Keep categories separate. Positive punch intent and exact boundaries must be reviewed against video; calibration is not validation. Ask a second reviewer for ambiguous cases, retaining uncertain labels rather than forcing them positive/negative.

For every attempted movement identify onset, peak, recovery and evaluation window. Include negative windows so false positives can be measured. Label complete footage if claiming full-recording precision; events outside reviewed windows remain explicitly unscored. Timing errors only use reviewed boundary timestamps. No claiming feints distinguished by skeleton alone.

Reviewed label file example (illustrative times, not labels for existing videos):

```json
{"schemaVersion":1,"kind":"fireroom-reviewed-movements","clipId":"COPY_EXACT_CLIP_ID","labels":[{"id":"jab-1","startMs":1000,"endMs":2500,"kind":"jab","hand":"left","category":"correct-punch","reviewer":"reviewer-initials","reviewed":true,"split":"evaluation","onsetMs":1200,"peakMs":1500,"recoveryMs":2100},{"id":"adjustment-1","startMs":3000,"endMs":4500,"kind":"negative","category":"guard-adjustment","reviewer":"reviewer-initials","reviewed":true,"split":"evaluation"}]}
```

Supported categories:correct-punch,short-punch,feint,guard-adjustment,elbow-occlusion,camera-change,idle. Assign kindjab/cross/negative based independently observed/intended action. Reject overlapping evaluation windows; do not give one event multiple matches. Reviewed negative intervals must include recovery/activity tails to assess false positives. Use the same labels and pose stream for both detectors.

Initial physical acceptance targets remain18/20jabs,18/20crosses,atmost1falsepunch/20nonpunchactions,correct sequence order and recoveryaftertrackingloss. Report precision/recall,FP counts and onset/peak/recovery mean absolute error bycategory. Timestamp error limits need an agreed sampling-aware target; do not invent a passed limit retrospectively. Extension grading requires separate reviewed, viewpoint-compatible reference validation. Fire TV testing remains a separate hardware gate.
