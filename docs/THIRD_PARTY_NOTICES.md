# Dependencies, models and asset provenance

FireRoom’s original code and documentation are licensed under the [MIT License](../LICENSE), copyright2026FireRoom contributors. This grant does not relicense third-party components or the Atlas artwork listed below. Atlas artwork is excluded from the MIT grant. The owner confirmed on23October2026 that it was created/generated for FireRoom and may be published. No additional artwork reuse license is granted here. This inventory records separate applicable terms; it does not invent rights to third-party material.

| Component | Use | Upstream / license information |
|---|---|---|
| Three.js | WebGL scenes, procedural environment, gloves, bag and rival | [Three.js](https://github.com/mrdoob/three.js), MIT; preserve upstream notices |
| MediaPipe Tasks Vision | Phone-local pose inference, normalized and estimated world landmarks | [MediaPipe](https://github.com/google-ai-edge/mediapipe), Apache-2.0 code; downloaded models and other assets require their own applicable terms |
| Pose Landmarker models | Lite / Full / Heavy model variants fetched at runtime | [Official model documentation](https://ai.google.dev/edge/mediapipe/solutions/vision/pose_landmarker); no model weights are included in this repository |
| qrcode | Local QR encoding | [node-qrcode](https://github.com/soldair/node-qrcode), MIT |
| TypeScript, Vite, Vitest and development dependencies | Build and tests | Exact versions in package-lock.json; inspect installed package license/NOTICE files |
| Amazon Vega SDK, React Native Kepler and WebView | Native TV wrapper | Separately installed Amazon packages and SDK; their applicable licenses/SDK terms apply |
| cloudflared | Optional externally installed tunnel connector | [cloudflared](https://github.com/cloudflare/cloudflared), Apache-2.0; not bundled |
| src/graphics/assets/atlas.png and atlas-tutorial.png | Atlas artwork used by the app | Generated for FireRoom using built-in image_gen; the tutorial sheet uses the original Atlas sheet as its reference. Publication authorized by the owner on23October2026. Separate from the code MIT grant; see ARTWORK_PROVENANCE.md |
| Procedural graphics / rival / ghost motion | Game presentation | Original project source licensed under MIT |

External research references are catalogued in DETECTION_REFERENCE_REVIEW.md, ACM_SEQUENCE_REVIEW.md and COACH_RULE_RESEARCH.md. A reference is not evidence that its code or data is bundled. Do not add downloaded training datasets, third-party video clips, model weights, or participant recordings without checking permission and privacy.
