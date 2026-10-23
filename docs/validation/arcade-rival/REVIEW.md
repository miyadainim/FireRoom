# Arcade art review — The First Rival

2026-10-22. Implementation and visual verification complete for user review. Art acceptance remains with the user; stop before adding new combat mechanics.

## What changed

Ren Mori replaces the rigid primitive opponent with an original articulated procedural 3D anime boxer. The model uses a tapered ribcage, defined shoulders/pectorals, connected shoulder–elbow–wrist segments, anatomically tapered arms/legs, a sculpted face and textured hair silhouette. Red gloves have thumb and cuff shapes; navy boxing shorts have two cloth legs and fitted cream hems; high-top shoes preserve a readable staggered stance. This is actual 3D geometry, not a portrait billboard or calibrated player overlay.

No reusable rigged/skinned character was present in the project. A connected procedural model was chosen to retain the existing authored state animations and predictable packaging. It is not a production skinned asset; some procedural surface/joint seams remain and the desired semi-realistic anime appearance should be judged from the screenshots.

Idle/guard includes breathing and weight movement. Approach/retreat uses alternating lifted shoes and planted-foot compensation against root movement. Jab and cross retain their actual gameplay hand/state, with shoulder/torso contribution and recovery. Block raises the guard; hit reactions alter body/head/brows/mouth; end states use lowered/raised hands and head poses. Ready/paused displays guard rather than marching. A hit-reaction recovery does not invent a new strike.

The traditional gym adds aged canvas, wooden flooring beyond the ring, muted red/cream/blue ropes, padded corners and turnbuckles, industrial fixtures, hanging bags, vintage posters, benches/lockers and gym signage. Dressing is secondary to the rival. Warm key light, restrained rim light, matte toon materials and layered grounding shadows replace expensive screen effects.

The camera stays at player eye height1.64m, uses48° vertical FOV and closer virtual framing, while retaining automatic approach/retreat distance mapping. Player gloves now have thumb/cuff geometry and connected tapered forearms; jab/cross are authored event-driven animations, never exact tracked fist positions. No shake or required player locomotion.

HUD: player/Ren health, round/timer, small tracking marker and Menu remain visible. The old persistent instruction card is absent during combat. Ready connection instructions use a compact corner overlay at TV widths. Countdown, pause, lost tracking and results appear only when needed. Setup, pairing, Pause and Coach navigation live in the secondary menu. A3second countdown precedes the unchanged combat round; opening the menu, hiding the page or losing tracking cancels it. Bell/opening framing and end poses are presentation only.

## Before and after

- `before-vega.png`: actual original Arcade VVD screenshot.
- `simulator.png`: actual final1920×1080 Vega screenshot, including final shorts and anatomy tapers.
- `after-browser-active.png`: actual recorded-input combat with the compact HUD and no instruction overlay. Captured before the last minor shorts/taper polish; final native image is authoritative for final model appearance.
- `after-browser-ready.png`: browser ready view from before the last taper refinement.
- `native-select-menu.png`: actual current native menu with visible focused Back to ring control.

All screenshots are rendered application captures. None were generated or retouched.

## Verification

| Check | Result | Evidence / boundary |
|---|---|---|
| Full regression suite | PASS |593/593 tests,65files, `tests.log` |
| Final art geometry checks | PASS |5/5, `art-final.log`: finite human bounds, connected limbs, distinct guard/telegraph/attack, no phantom recovery strike, grounded end poses, anatomical taper, gym disposal |
| Production TypeScript/Vite build | PASS |`build.log`; existing bundle-size warning remains |
| Native Vega wrapper build | PASS |`vega-build.log` |
| Native final model/gym/HUD rendering | PASS |`simulator.png`, actual1920×1080 VVD; `vega-launch.log` |
| Native directional focus / Select menu | PASS scoped |`native-remote-results.json` plus actual focused/open menu screenshot; native injected remote keys, not physical remote hardware |
| Recorded inputs still drive hits/blocks | PASS browser/integration |`recorded-punches.json`, `after-browser-active.png`; no new physical recognition claim |
| Combat rules, AI, damage, recognition, relay and Coach | Preserved; regression PASS |No changes to engine/CV/relay/Coach source in this art pass |
| Fresh live phone-controlled Vega round | NOT VERIFIED |No new live physical test performed |
| Sustained Vega FPS / precise latency | NOT VERIFIED |Static rendering and package success do not prove frame rate |
| Final artistic acceptance | USER REVIEW |Screenshots supplied; no automatic claim of visual approval |

An interrupted native restart previously timed out; a fresh restart on continuation succeeded. The final package was installed and launched, then captured. Original hosted-target source configuration was restored after the temporary standalone verification build. The standalone `file://` package proves graphics/remote behavior only: hosted HTTPS is still needed for phone API/pairing. No new tunnel or external upload was created.

## Performance approach and limitations

Static geometry budget before the last taper-only refinement:112 rival meshes /34,664triangles;102 gym meshes /2,110triangles. Taper changes do not change topology. Five procedural gym textures replace many surface-detail meshes. Rendering retains a1.5pixel-ratio cap, no dynamic shadow pass and no full-screen postprocessing. Draw calls and sustained frame rate should still be measured on target hardware; this is a restrained implementation, not a measured performance guarantee.

Footwork, torso turn, recoil and contact accents are authored gameplay presentation. They are not measured biomechanics, force, actual contact location or a calibrated pose overlay. End-pose and animation geometry have automated evidence; complete native state-by-state animation and physical phone timing still need human review.

## Files changed

- `src/graphics/arcade-rival.ts` — new character and articulation.
- `src/graphics/arcade-gym.ts` — new classic gym dressing/materials.
- `src/graphics/arcade-scene.ts` — integrated camera, lighting, rival/gym, player arms and effects.
- `src/arcade.ts`, `src/arcade.css` — HUD, conditional overlays, countdown and menu focus.
- `tests/arcade-art.test.ts` — geometry/animation/resource regressions.
- Required status/decision/matrix/known-issue reports and review evidence.

Gate: implementation, regressions and scoped native visual/menu checks PASS. Stop for user visual review. Live physical validation/performance gate remains NOT VERIFIED.
