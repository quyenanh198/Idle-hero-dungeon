# Visual v3 art generation

Generated with the built-in `image_gen` tool, using the supplied gameplay frames as visual references. These are new raster assets, not extracted original models. Alpha transparency is preserved; no image processing was used to repaint these outputs.

## Final assets

- `champion-v3.png`: 8 columns × 4 rows; 32 views/poses. Rows: idle, left step, passing pose, right step. Columns: down, down-left, left, up-left, up, up-right, right, down-right.
- `weapons-v3.png`: 3 columns × 2 rows; iron cleaver, purple reaver, green star, stone hatchet, flame axe, frost reaper. `anchors.json` contains handle-pommel attachment coordinates measured from alpha bounds.
- `enemies-v3.png`: 4 columns × 3 rows; idle/left step/right step/attack for horned imp, crystal golem and armored crab.

## Champion prompt

Production-ready transparent game sprite animation atlas, exactly 8 equal columns and 4 equal rows, 32 isolated sprites, regular cell alignment, same scale and baseline. No labels, borders, weapons, chains, health bars, UI, ground, scenery or ground shadow. Match the elevated 55-degree camera in the supplied hero/gameplay references.

Enormous hunched orange butcher with broad muscular shoulders and hanging forearms, short dark green trousered legs, heavy dark boots, orange/gold skin, rusty red-orange back panel with visible dark stitched seams and metal staples. Tiny head low between shoulders, round brown leather-and-iron cap with steel rim and short pale ivory side horns, gruff small face, leather harness and iron attachment rings. No barrel/wooden-plank hat, beard, moustache, weapon or shield. Polished mobile RPG 3D pre-rendered art, sculpted anatomy, smooth shaded planes, restrained faceting, detailed leather and metal, warm top-left light and cool fill, clean edges. Consistent identity across directions and actual changes to legs/arm poses.

Column order: down/front; down-left; left profile; up-left; up/back; up-right; right profile; down-right. Row order: planted idle; left-foot-forward stride; passing pose; right-foot-forward stride. Keep equal cell margins, full figure, genuine transparency.

## Weapon prompt

Final transparent 3×2 full-weapon atlas. Same scale and regular cells, generous padding, handles downward, no attached chains, no character, labels, UI, pedestals, floor or shadows. Match the supplied weapon screenshot colors and silhouettes. Premium stylized 3D materials, bevelled metal, crisp dark contours, warm top-left light, elevated 55-degree three-quarter camera.

Row 1: worn grey iron cleaver, curved pale silver edge, wood handle/rivets/black grip; jagged purple crescent reaver with rear spines, round indentations, pale lilac edge and red leather handle; three-pronged neon green star blade on grey socket with pale lime edges and black haft.

Row 2: primitive short stone hatchet with brown/grey socket, ivory chipped crescent edge and two rivets; orange/red flame axe with rear flame fins, cream cutting edge and red grip; indigo hooked frost reaper with blue icy teeth, periwinkle edge, violet inset eye and navy handle. No bow/crossbow substitutes.

## Enemy prompt

Final transparent 4×3 enemy animation atlas matching the champion rendering style and supplied monster reference. Elevated 55-degree camera, warm key/cool fill, consistent down-left facing, same baseline/scale per row. No floor, ground shadows, labels or UI.

Row 1: small stocky brown imp, oversized head, pointed ears, short ivory horns, angry eyes, large nose, toothy grin, leather loincloth/belt, dark boots and worn iron hand axe. Row 2: dark teal frost golem, glowing eyes, brilliant cyan shoulder/chest crystals, dark navy forearms/lower legs, chunky hands/feet. Row 3: armored lava crab, rusty crimson segmented shell, gold spikes, purple/brown pincers, six legs and yellow eyes. Columns: planted idle, left stride, right stride, attack lunge/raised weapon or claws. Keep identity and proportions consistent.

## Runtime use

`scripts/compile-art.cjs` embeds PNG data URLs for WebGL to support offline direct-file launch. UI uses the same weapon PNG. `art-renderer.js` samples the atlases; turning blends adjacent directions and movement loops actual walk poses. `characters.js` supplies live instanced steel chains, trails and projected weapon shadows. The prior procedural units are preserved under `backups/visual-v2/`.

## Environment and HUD continuation (v1.3.0)

Built-in ImageGen generated `environment-v4.png` and `ui-v4.png`, using the existing champion, weapons and supplied game frames as visual references. Original PNGs are retained unchanged.

Environment prompt: final transparent 4x4 prop atlas, premium stylized 3D pre-rendered mobile RPG look, elevated 55-degree camera, warm upper-left light/cool fill, sculpted readable materials, centered full objects, no text, panels, ground or shadows. Row-major subjects: forest spruce; broad leafy tree; snowy blue-teal spruce; orange-roof stone/timber cottage; mossy boulder; snowy icy rock; oak/iron barrel; stacked supply crates; orange-striped timber market stall; covered supply wagon; violet runed stone portal; cyan crystal cluster with red mineral base; gold-banded treasure chest; purple-orb stone totem; rooted cut stump; wooden fence. Actual object regions and root pivots are measured in `environment-v4.frames.json` because generated row heights are not perfectly uniform. `scripts/measure-environment-art.py` reads alpha only and does not modify the PNG.

HUD prompt: final transparent 4x2 premium RPG utility icon atlas, coherent with the champion/weapon art, centered and readable at 40px, clean dark contour, no text or background. Row-major subjects: bronze-rimmed orange champion portrait; steel chained butcher hook; three blue gems; horned ivory skull; green-awning shop; orange leather backpack/gold buckle; green regeneration heart/plus; purple soul-orb stone ring.

Environment layout correction: a second built-in ImageGen edit preserved the sixteen prop identities but repacked them into a square 4x4 sheet, with each object occupying at most 60% of its cell and at least 20% transparent margins. This removed overlapping crop rectangles and detached neighboring fragments. The initial tightly packed output is retained only in local ignored backups. The final original output PNG is measured without repainting or pixel edits; the non-overlap invariant is tested.

## Champion and arsenal action revision (v1.4.0)

Built-in ImageGen edited champion-v3 into champion-v5: preserve the 8-direction x 4-pose layout, orange hunched butcher, horned cap, green pants, red stitched back and steel rings; simplify broad angular muscle/color planes and remove texture noise. Original output retained unchanged.

Built-in ImageGen generated champion-attack-v5 from champion-v5: transparent 8x4 companion atlas. Columns down/down-left/left/up-left/up/up-right/right/down-right. Rows windup with forearms raised and knees braced, outward release, low follow-through and recovery. Preserve the same identity, ground alignment, color/materials, no weapons, chains or text. This separate sheet is selected during real combat strikes, then returns to locomotion.

Built-in ImageGen edited weapons-v3 into weapons-v5: transparent 3x2 atlas, broad iron cleaver, purple serrated crescent with red wrap, emerald star, pale stone hatchet, orange flame axe and midnight-blue frost crescent. Clean broad geometric bevel planes instead of noisy cracked textures; full silhouettes, upright handles, no text. Measured actual bottom-pommel alpha positions are stored in anchors-v5.json; no PNG pixels were altered.

Rendering uses one discrete directional view at a time to avoid translucent double silhouettes. Six weapon paths use different radii, lift and bounded phase variation while preserving readable angular spacing. Weapon blade vectors point radially outward. Chains attach to measured pommels; weapon shadows and colored motion ribbons remain live.
