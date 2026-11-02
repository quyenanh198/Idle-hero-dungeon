# Reference fidelity correction — visual v2

The user rejected the initial models, animation, champion, sprites and monsters. The original generic Viking/slime scene was insufficient. This revision is authorized as a correction to the existing game, maintaining local desktop/mobile delivery.

## Evidence

Extracted full-resolution reference frames at 20s (snowfield) and 100s (grass combat), plus combat sequences at 98–103s. See `docs/reference/closeups/`.

Observed: large rounded orange stitched champion with a rust-colored back panel, small round metal-rimmed brown cap, pale side horns, shield and leather harness. Weapon heads include a purple serrated crescent, green star, grey cleaver, pale stone hatchet, orange flame axe and blue crescent. Steel chains visibly connect to the champion. Brown horned creatures and dark teal crystal-armored enemies walk on limbs. Camera is steep and nearly orthographic. Grass has tufts/flowers, snow follows raised cliff edges, and the lane is cobblestone. Mobile UI floats over the world with a large minimap, overhead HP and a seven-item dock.

## Implementation

- `characters.js`: dedicated articulated champion, distinct weapon meshes, instanced metal links, short motion ribbons, imps, crystal golems and armored crab.
- `motion.js`: smooth turning, continuous swing phase, chain sag and gait curves. Weapon speed accelerates in combat without resetting phase.
- `world.js`: orthographic camera, denser vegetation, snow cliff geometry, market props, actual creature animation and hit/death timing.
- `reference.css` and SVG symbols: full-screen responsive HUD, seven slots, overhead HP, locally bundled Lilita font, brown panels and outlined labels.
- Six weapon slots and a one-time legacy save migration preserve earned currency, kills and existing weapon levels.

## Validation

Unit checks cover phase continuity, shortest-arc turning, chain endpoints, finite extended swing values, gait and old-save migration. Updated browser QA targets the revised visible controls at desktop, tablet and mobile sizes. Capture actual gameplay from the built app, inspect screenshots and provide a before/reference/after comparison.

## Limit

These models are manually reconstructed from rendered footage. Original meshes, animation clips and textures are unavailable, so visual identity cannot be claimed. Functional tests demonstrate behavior; screenshot/video review is required for visual claims.
