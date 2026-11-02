# Assets, animation and gameplay continuation

**Objective:** Continue improving the existing video-inspired local game across remaining assets, animation and gameplay; merge every completed step into `quyenanh198/Idle-hero-dungeon` main. Keep the goal active across continuation limits until the full sequence is verified.

**Architecture:** Keep the offline HTML/Three.js app and existing rendered champion/weapon/enemy atlases. Add coherent environment assets, a deterministic combat simulation separate from rendering, and persistent hook/consume progression. All new transactions and save migrations must be tested.

## Global requirements

- Preserve desktop/mobile layouts, direct-file and localhost entry points, local save/export/import and generated-art source prompts.
- Do not upload the user's reference video, extracted phone screenshots, old backups, local saves, recordings or build ZIPs into source control.
- Each step uses its own branch, local checks, independent review, PR, CI and merge to main. Inspect the resulting main SHA before starting the next branch.
- No force push or bypass of repository merge rules.

## Step 0 — Publish the playable baseline

- [x] Import runtime, generated assets, tests and reproducible pinned browser dependencies.
- [x] Add CI for syntax, unit tests, local build, browser flows and art/resource checks; exclude reference media/backups.
- [x] Verify locally, review the source, open a PR and merge after CI passes. PR #1 merged as `b79f38507ce092c20f0626d78399ce62b4c4f25a`; CI run 41403059094 passed.

## Step 1 — Complete environment and utility art

- [x] Generate a coherent transparent environment atlas: forest/snow trees, rocks, barrel/crate, market/tent, portal, crystal and chest.
- [x] Replace remaining coarse cone/box props with anchored rendered sprites, retaining spatial shadows and correct front/back occlusion.
- [x] Add idle environmental motion and a review gallery; inspect desktop/mobile screenshots and asset boundaries.
- [ ] Verify art load/resource behavior and gameplay regressions, review, PR and merge.

## Step 2 — Combat animation and enemy behavior

- [ ] Extract combat math/state from `world.js` into a deterministic module with tests for cooldowns, damage/status effects, deaths and reward-once behavior.
- [ ] Give the six weapons distinct slash, poison, blunt, fire and frost behavior and matching impact/trail effects.
- [ ] Replace shared enemy hit timing with individual windup/attack/recovery states. Add dodgeable boss telegraphs and a low-health phase.
- [ ] Integrate bounded particles, recoil, clear damage feedback and responsive synthesized SFX; verify live browser combat and pause/resume.
- [ ] Review, PR and merge.

## Step 3 — Hook, consume and progression loop

- [ ] Implement a visible hook/capture/pull/consume sequence with manual keyboard/touch input and auto-battle activation.
- [ ] Award persistent, bounded stat gains for consumed enemies; preserve old saves via an explicit migration and export/import validation.
- [ ] Add interactive resource nodes and camp completion rewards so movement and exploration matter; prevent duplicate claims.
- [ ] Add prop collision handling, coherent targeting, cooldown HUD and clear progression feedback.
- [ ] Verify a complete fresh-save play loop through normal enemies, upgrades, skills, travel, boss, death/revive and save reload; review, PR and merge.

## Final audit

- [ ] Confirm all implementation steps are merged on remote main with passing CI.
- [ ] Build from the resulting main, verify runtime asset hashes and direct-file launch, refresh the local ZIP.
- [ ] Inspect actual desktop/mobile gameplay and a recorded end-to-end session. Report limitations accurately; do not equate functional tests with exact visual fidelity.
