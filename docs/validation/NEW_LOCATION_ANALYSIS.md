# New-location attempt — October 17, 2026

Source: `fireroom_trials/fireroom-form-assessment (4).json`, unchanged. User reports a different location, good lighting and no bright source near the fist. No matching video was supplied for this attempt, so landmark accuracy and the lighting's causal effect cannot be independently verified.

## Main result

The software **did confirm completion** for this prompted jab. The saved output is:

| Criterion | Output | Evidence |
|---|---|---|
| Opposite-hand guard | PASS | Full recorded coverage, no sustained outside interval |
| Reach | UNASSESSABLE | Optional bent-arm comparison not recorded |
| Recovery | PASS | Model-based recovery interval 774.6 ms |

Both arms have held reach references, but `bentReference` and `threshold` are null and reliability is `calibration-only`. Thus the reach **grade is not enabled**. This is distinct from the earlier attempts where insufficient observed radial increase prevented completion.

The old generic reach feedback incorrectly made missing optional calibration sound like a failed measurement. Updated wording explicitly says the optional comparison has not been recorded. The UI calls this case **Not enabled** and summarizes the two passing criteria. No criteria statuses, measurement values or recognition thresholds were relaxed.

## Replay details and remaining uncertainty

All 32 received frames are tracked; maximum gap 156.6 ms. Engine replay uses a guard baseline of 0.305159 m and stable peak 0.367941 m, a 0.062781 m increase, passing its provisional 0.05 m movement-support requirement.

The raw left distance ranges 0.164394–0.372642 m. Its minimum occurs about 1.142 s into the recorded attempt; the software's movement start occurs around 1.864 s and peak around 1.944 s. Without video, we cannot establish whether this selected phase matches the intended punch. A software PASS is not independent physical validation.

Held left reach is 0.289781 m versus approximately 0.3370 m during guard. This warrants continued investigation of reach-feature consistency; it does not prove incorrect landmark placement without visual evidence. Because location and lighting changed together, this recording cannot isolate lighting as the cause of the changed software outcome.

## Verification

Independent review: [NEW_LOCATION_REVIEW.md](NEW_LOCATION_REVIEW.md). The recorded-data regression preserves completion, guard/recovery evidence and recovery time while checking the corrected missing-calibration explanation. Original input remains unchanged. Physical punch correctness, landmark accuracy, lighting causality and Fire TV execution remain **NOT VERIFIED**.
