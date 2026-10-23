# Optional DTW role in bounded prescribed coaching

Rules answer whether observable guard → outward motion → return occurred in the prescribed hand/order. Technique criteria remain separate, confidence-aware observations. Optional constrained DTW can answer a different question: whether the estimated temporal trajectory resembles a separately reviewed demonstration despite moderate speed differences.

`checkPrescribedAttemptDtw` is disabled by default and requires all of these before alignment:

- An existing reviewed `DtwReference` with valid ordered phases and observation coverage.
- Explicit confirmation that the reference was independently reviewed; metadata alone does not verify review.
- The same prescribed drill and stance, plus an explicitly supplied matching camera-placement description. Matching text does not independently verify physical viewpoint.
- Ordered attempt observations with sufficient coverage and no unacceptable tracking gaps, enforced by the existing evaluator.

Existing reference contracts support **jab and jab-cross only**. Standalone cross returns `not-assessable`; the adapter never swaps hands, mirrors a reference or mislabels a cross as a jab. Reference capture/review is genuinely required; no reference is synthesized from the player's current attempt or selected solely because it yields a low distance.

The optional result remains separate from rules. `aligned` is sequence-comparison evidence, not a technique pass. `rejected` can mean insufficient coverage, a mismatched trajectory, incomplete reference-phase motion or recovery, or a short punch falling below the existing provisional75%-of-reference amplitude requirement. A short punch can therefore be recognized by the motion rules while failing this reference match. Neither result overrides recognition or proves punch intent. Existing DTW also requires both elbows visible and may abstain when wrist-only evidence remains usable.

No scalar distance is converted into overall form quality. `techniqueGrade` is always `cannot-assess`; elbow findings remain not-assessable without independently established observability. Timing is reported separately because warping can hide pauses or speed differences. No physical coaching accuracy is verified by synthetic fixtures. DTW should become required only if held-out evaluation demonstrates a concrete benefit over rules; it is optional experimental evidence now.

Software verification: focused tests cover disabled/no-reference defaults, independent-review and setup/drill compatibility, unsupported cross, valid synthetic alignment without form claims, idle/wrong-stance/gap rejection, malformed import handling and source immutability. Physical reference quality, viewpoint equivalence and coaching usefulness remain **NOT VERIFIED**.
