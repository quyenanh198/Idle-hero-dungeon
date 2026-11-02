# Living-world asset step — v1.3.0

- Replaced coarse prop meshes with sixteen coherent rendered assets and eight HUD icons.
- Repacked source art with large transparent gutters after review found overlapping crop rectangles; retained the initial source only in ignored local backups.
- Source measurement is read-only; PNGs are not repainted. Every measured region is bounded and pairwise non-overlapping.
- Added foliage sway, subtle runed-prop motion, root pivots, ground shadows and hero-occlusion fading.
- Paused scenes avoid repeated rendering, while travel, position, zoom, equipment, stats, healing and resize invalidate the cached world and projected HUD.

## Verification

- Syntax and local build passed.
- 26 unit tests passed, including five environment invariants.
- 36 gameplay/browser checks and nine artwork/resource checks passed.
- Environment browser review: sixteen props, live selection, direct-file HUD atlas, zero browser errors.
- Paused-world regression: travel, zoom, resize, equipment, stable cache and resume passed. The test failed on the old implementation before the fix.
- Independent re-review verified both crop and pause findings resolved, with no important blockers remaining.

Open `environment-review.html` for the live prop viewer and all measured object crops. QA captures and source reference media remain local/ignored; the generated source art and prompt specifications are tracked.
