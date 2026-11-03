# Animation, Movement & Combat Audit — 2026-11-02

## 1. Architecture Overview

- **Locomotion & Steering** (`movement.js`, `world.js`):
  - Swept sub-stepping (`move` at `0.2` unit steps, 3-pass circle-collider pushout) + 1-obstacle tangent ray avoidance (`steer`).
  - Yaw smoothing via exponential decay `(1 - exp(-12 * dt))` in `HeroMotion.turnTowards` (`motion.js`).
- **Sprite Animation** (`sprite-motion.js`, `art-renderer.js`):
  - **Champion**: 8-direction × 4-row sprite sheets (`assets/art/champion-v5.png`, `assets/art/champion-attack-v5.png`). Walk cycles rows `[1,2,3,2]` at 7 FPS (`walkRow`); attack plays rows `0..3` over `0.52s` (`attackRow`), layered with procedural bob, sway, and squash/stretch (`attackPose`).
  - **Enemies**: 4-col × 3-row sheet (`assets/art/enemies-v3.png`). Column `0` idle, `[1,0,2,0]` walk (7 FPS), column `3` windup, with horizontal UV flip (`Math.sin(facing) < 0`).
- **Combat & Arsenal Motion** (`characters.js`, `motion.js`, `combat.js`, `combat-fx.js`, `hook.js`):
  - 6 orbiting weapon sprites tethered to hero shoulders via 22-link `InstancedMesh` 3D torus chains (`chainPoint` catenary slack `0.4` idle → `0.12` combat) + 8-segment ribbon trails.
  - Fixed-step `60 Hz` combat simulation (`HeroCombat.step`), ground telegraph rings (`windup`), instanced icosahedron bursts (`CombatFX`), and 3-phase grapple hook (`outbound` → `reel` → `consume`).

---

## 2. Animation & Movement Defects Found

1. **Weapon attack completely decoupled from weapon orbit position** (`combat.js`, `characters.js`)
   - Weapons orbit continuously on a sine/cosine loop (`weaponPose`). When a weapon cooldown fires in `combat.js`, the weapon sprite does not lunge or swing toward the hit target (`event.x, event.z`)—an impact ring pops under the enemy while the weapon floats elsewhere.

2. **Weapon sprites all look like axes/scythes despite names (`bow`, `staff`, `crossbow`, `hammer`)** (`assets/art/weapons-v5.png`, `art-renderer.js`)
   - `weapons-v5.png` contains 6 melee axe/scythe heads; `bow`, `staff`, and `crossbow` render as orbiting axes on chains with no projectile animation.

3. **Weapon white-border halo / alpha fringe in 3D view** (`art-renderer.js`, `qa/combat-desktop.png`)
   - `alphaTest: .07` with `LinearFilter` on un-premultiplied white background in `weapons-v5.png` leaves jagged white pixel halos around every orbiting weapon.

4. **Champion sprite scale jitter across walk/attack frames** (`art-renderer.js`, `assets/art/champion-v5.frames.json`)
   - Tight alpha bounding boxes (`champion-v5.frames.json`) have varying `w`/`h` per frame, and `sprite.center.set(.5, 0)` anchors to each cropped box's bottom-center rather than a consistent foot pivot. As arms/legs extend, the body shifts horizontally and pops slightly between frames.

5. **Enemy species mismatch: Camp 0 ("Slime meadow") & Camp 1 ("Goblin grove") both render Horned Imp** (`art-renderer.js`, `world.js`)
   - `const species = boss ? 2 : kind === 2 ? 1 : 0;` maps both `kind === 0` (Slime meadow) and `kind === 1` (Goblin grove) to row `0` (Horned Imp). No slime sprite exists.

6. **Enemy `strike` animation frame missing** (`art-renderer.js`, `combat.js`)
   - Enemy `s.state` transitions `approach` → `windup` → `recovery`. During `windup`, the enemy holds static frame `col = 3` (raised weapon), then on strike immediately snaps back to `col = 0` (idle) during `recovery` with zero strike/follow-through motion or lunge toward the hero.

7. **Walk cycle unaffected by movement speed, Frost slow, or Enrage speed** (`art-renderer.js`)
   - Enemy walk frame `Math.floor(time * 7) % 4` and bob `Math.sin(time * 11)` use global `time` instead of accumulated movement distance or speed-scaled phase, so slowed/enraged enemies moonwalk. The champion walk cycle also uses `time * 7` regardless of `settings.speed` upgrades.

8. **Enemy-to-enemy overlap / stacking** (`world.js`, `combat.js`)
   - Enemies only collide against static environment props (`colliders`), never against other enemies or the hero. Multiple enemies approaching the hero collapse into the exact same `(x, z)` coordinate and z-fight.

9. **Unused `HeroMotion.gait` & `HeroMotion.swingTarget` dead code** (`motion.js`, `art-renderer.js`)
   - `gait()` and `swingTarget()` in `motion.js` are only called in unit tests; `art-renderer.js` duplicates its own hardcoded sine bob/rotation math.

10. **Paused frame resets champion to idle** (`world.js`)
    - `if(paused && renderOnce) heroModel.update(time, 0, false, facing, false)` forces `moving = false, combat = false` whenever a modal opens or the window resizes while paused, snapping the hero out of mid-stride/combat pose.
