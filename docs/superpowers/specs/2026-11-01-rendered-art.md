# Visual v3: champion and arsenal quality revision

The user rejected the v2 champion/weapons as insufficiently game-ready and authorized another revision. The central defect was asset quality, so this pass changes the rendering approach rather than incrementally adjusting primitive proportions.

## Art and runtime

- Generate a coherent set of transparent pre-rendered 3D-style atlases from the supplied gameplay references using the built-in imagegen tool.
- Champion: 8 directions × 4 poses; sculpted shoulders/arms, readable hands/boots, leather cap/iron rim, orange skin and rusty stitched back panel. Eight-way turns blend adjacent atlas views in one shader; idle and 3-pose strides are selected independently.
- Weapons: six distinct detailed heads/handles; shared source art for live combat and inventory icons. Measure pommel anchors from alpha bounds so steel chains meet the handles.
- Enemies: idle, left/right stride and attack frames for brown horned imp, ice golem and armored lava crab.
- Preserve actual movement, combat, economy and saves. Retain 3D instanced chains and trajectories, motion ribbons, projected weapon shadows, soft character ground shadows, hit recoil and attack compression.
- Remove the obsolete primitive character renderers. Keep their prior files in backups/visual-v2.

## Packaging and review

PNG data URLs support WebGL under file:// without cross-origin image uploads. Copy the weapon PNG for CSS UI use. `scripts/compile-art.cjs` runs during local build. Persist original generated art and prompts in assets/art.

Create a close-up live asset viewer, gameplay capture and before/reference/after comparison. Check art loading, sprite frame/direction sampling, shader compilation, equipment cleanup without disposing Three.js shared Sprite geometry, desktop/mobile layouts, direct-file launch, and existing gameplay regressions.

This is a rendered sprite reconstruction, not the original game's asset set or continuous 3D skeletal model. The viewer and video show the actual runtime result for visual assessment.
