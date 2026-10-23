# Prescribed jab and cross: coach observations to rules

Research date: October19,2026. Primary sources: [England Boxing Level1 handbook](https://www.englandboxing.org/wp-content/uploads/2022/03/EB_Boxing-Coaching-Handbook-Part-1_v8-002.pdf), printedpp73–75 (PDF72–74); [IBA Coaches Manual](https://www.iba.sport/documents/iba-coach-manual/), printedpp40–43 (PDF39–42). These support coaching priorities, not numerical CV thresholds or our detector's accuracy.

England Boxing describes a supported stance, coordinated rotation, guarded opposite hand, protected chin and return after straight punches; cautions include telegraphing and overcommitting. The rear straight adds coordinated rotation without losing balance. Its teaching points are more extensive than monocular landmarks can certify.

IBA distinguishes lead and rear straight punches, maintaining the other hand, and retracting toward the starting position. It recommends progressing from stationary punches to movement and combinations. It also notes faults in fist orientation, head posture and foot positioning. These are not all observable from our phone view.

|Coach observation|Rule opportunity|MVP treatment|
|---|---|---|
|Start ready in guard|Existing face-relative guard history before expected onset|Supported observation or cannot-assess|
|Use prescribed hand/order|Stance maps anatomical hand; bounded cycle association|Reject wrong hand/order; don't count off-window movement as another repetition|
|Other hand protects face|Time-resolved opposite-hand guard evidence during outward phase|Report observed sustained departure, not inferred vulnerability/injury|
|Return hand to guard|Cycle return plus guard observations|Independent recovery observation and measured timing; no universal fast/slow grade|
|Direct delivery/retraction|Projected trajectory relative to starting guard|Diagnostic initially; viewpoint can hide direction, no strict straight-line perfection claim|
|Elbow extension/reach|Only reviewed compatible calibration and reliable geometry|Optional cannot-assess by default; not movement-completion gate|
|Cross rotation/stance balance|Visible shoulder/hip motion may be diagnostic|Do not grade exact weight transfer, balance or required rotation from this setup|
|Chin/fist/knuckle positioning|Requires reliable face/hand orientation evidence|Defer; current pose wrists/nose do not establish these details|
|Force/contact/safety|Not observable from skeleton alone|Never claim measured force, actual impact or injury risk|

Engineering policy: use timestamp coverage, per-feature visibility and gap checks. Thresholds remain provisional and require reviewed positive/deviation/occlusion examples. A supported criterion does not mean globally correct technique. Missing observations must not turn into a technique error. One completed cycle does not prove punch intent; prescribed task context narrows the ambiguity without resolving it mathematically.

DTW: reuse existing constrained aligner only after rules locate the intended bounded attempt. Require reviewed same-placement, same-stance, compatible reference; expose phase alignment and coverage separately. Existing DTW amplitude heuristics may reject deliberate short punches, so it must not silently override rule recognition or produce an overall technique score. No DTW reference has been physically certified in this milestone. Standalonecross is unsupported by the existing reference schema and must abstain until separately designed/reviewed.

Plan: bounded jab/cross/jab-cross rule reports → lab inspection and live preview → independent fixtures and recorded replay → human review of specific guard/recovery feedback → optional DTW reference review. Existing unrestricted detector is preserved as a comparison component rather than tuned for all off-drill activities.
