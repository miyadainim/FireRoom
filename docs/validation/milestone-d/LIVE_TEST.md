# Milestone D live phone/Vega procedure

Consent: user explicitly approved a temporary Cloudflare HTTPS tunnel for pose/session messages; raw camera video remains on phone. Existing protected gateway, relay and runtime controller provisioning reused. No new transport or provider.

Check actual evidence before assigning PASS:

1. Phone scans Vega QR, MediaPipe Full initializes and actual pose frames reach Vega.
2. Choose Orthodox on tutorial and phone; read stance instructions and self-confirm comfortable setup. This is not automatic foot/posture validation.
3. Watch guard; choose Practise guard. Hold both wrists near same-side eyes with relevant landmarks visible for 600ms source time. Keep holding until Continue becomes enabled; observe actual message. The underlying detector thresholds remain unchanged.
4. Briefly cover/turn away camera or lower phone: tutorial must report camera adjustment when landmarks unreliable and revoke observed Continue. Do not score this as poor technique.
5. Restore view, Retry, re-establish hold, Continue to Jab.
6. Demonstrate Jab/Cross, test stable mapping. Actual punch completion still uses existing evaluator; no synthetic event is physical evidence.
7. Replay stance/guard, select Southpaw and match phone. Ensure right leads; repeat if practical.
8. Returning completed tutorial Skip works; recorded guard skipped vs observed must remain distinct.
9. Native Vega D-pad moves among visible controls, including disclosures; Select executes Watch/Practise/Continue. Browser keys alone do not prove native remote behavior.

Use aggregate gateway/native diagnostic logs and user observations; do not copy raw pose coordinates into reports. Mark unperformed steps NOT VERIFIED. A successful single session does not establish population accuracy or medical/biomechanical validity.

## Live usability defect and fix

Actual user could establish guard, but could not lower a hand to click Continue because permission was tied to current guard. Original live trace confirms observed->tracking/hand-change->disabled; user reported the physical interaction conflict.

Fix: achieving the600ms task now latches historical observed completion for that tutorial attempt. Message explicitly permits lowering hands. Retry/restart clears completion. Before success, unreliable/stale data still resets the pending hold and produces camera guidance. No vision threshold was changed. Post-fix automated538tests/build PASS; live lowered-hands/Continue retest in progress on a fresh paired session.
