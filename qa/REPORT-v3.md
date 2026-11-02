# Rendered-art revision — v1.2.0 / visual v3

User feedback required a substantive asset-quality revision. Replaced the procedural champion/weapon/monster renderers with coherent generated raster atlases, while keeping live 3D chains, shadows, movement and combat.

## Evidence

- `npm run check`: passed for all runtime source modules.
- `npm test`: 21 passed, 0 failed.
- `tests/browser.cjs`: 36 gameplay/layout checks passed, zero page errors or external runtime requests. Desktop, tablet, portrait mobile and landscape layouts; direct-file launch included.
- `tests/art.cjs`: 9 passed. Actual decoded champion atlas, walk-frame selection, back-facing artwork, shader compilation, repeated equipment swaps without shared geometry disposal or accumulating GPU resources, and inventory atlas loading from the built file.
- Built-app capture completed with zero page errors: `v3-gameplay.mp4`, `v3-mobile.png`, `v3-frost.png`, `v3-boss.png`, `v3-desktop.png`, `v3-inventory.png`.
- Independent review checked shader wraparound, image readiness, direct-file bundling and disposal. Its shared-Sprite-geometry finding was fixed and verified by the art stress check.

## Visual review

Open `asset-review.html`: live close-up, all eight directions, idle/walk/combat, turntable, weapon selection and zoom. `compare.html` places video reference / v2 / v3 side by side. Source atlases and prompt specs are saved in `assets/art/`.

Champion uses 8 directional images with 4 idle/walk poses; directions blend, so this is a rendered sprite animation rather than an original continuous skeletal model. Weapons and three enemy species use the same rendering style. The original game's meshes and animations have not been imported.

Original generated PNG alpha is preserved. Embedded data URLs avoid file-origin WebGL image restrictions. UI weapon icons use the same PNG as combat. The local ZIP contains the built runtime; no installation or remote asset service is required for play.
