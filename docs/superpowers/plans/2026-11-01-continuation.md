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
- [x] Verify art load/resource behavior and gameplay regressions, review, PR and merge. PR #2 CI run 41405958455 passed; merged as 71ae2a43debb0e582548ffd692d3c9b860d18c8b.

## Step 2 — Combat animation and enemy behavior

- [x] Extract combat math/state from `world.js` into a deterministic module with tests for cooldowns, damage/status effects, deaths and reward-once behavior.
- [x] Give the six weapons distinct slash, poison, blunt, fire and frost behavior and matching impact/trail effects.
- [x] Replace shared enemy hit timing with individual windup/attack/recovery states. Add dodgeable boss telegraphs and a low-health phase.
- [x] Integrate bounded particles, recoil, clear damage feedback and responsive synthesized SFX; verify live browser combat and pause/resume.
- [x] Review, PR and merge. PR #4 merged as `76912135d0f17d398117e88dccae0219a75b38ef`; CI passed.

## Step 3 — Hook, consume and progression loop

- [x] Implement a visible hook/capture/pull/consume sequence with manual keyboard/touch input and auto-battle activation.
- [x] Award persistent, bounded stat gains for consumed enemies; preserve old saves via an explicit migration and export/import validation.
- [x] Add interactive resource nodes and camp completion rewards so movement and exploration matter; prevent duplicate claims.
- [x] Add prop collision handling, coherent targeting, cooldown HUD and clear progression feedback.
- [x] Implement and merge the progression loop as `086987c6ef4d74c21dee031ac9818f40295fc001`; CI passed. Fresh-save browser journey verification is part of the v1.0.0 release audit.

## Final audit

- [ ] Confirm all implementation steps are merged on remote main with passing CI.
- [ ] Build from the resulting main, verify runtime asset hashes and direct-file launch, refresh the local ZIP.
- [ ] Inspect actual desktop/mobile gameplay and a recorded end-to-end session. Report limitations accurately; do not equate functional tests with exact visual fidelity.

## Additional user feedback: champion/arsenal v5

- [x] Cleaner locomotion art, dedicated 32-frame attack sheet, rebuilt six-weapon atlas and measured pommels.
- [x] Remove directional ghosting; implement attack stages and outward oriented, individually varied weapon paths with spacing checks.
- [x] Local checks and independent review pass.
- [x] Publish and merge focused visual revision after CI. PR #3 CI 41409684831 passed; merged as 6b17e347a224e607b4e45d5f831c268aa22428fa. Continue the combat/gameplay steps above.
