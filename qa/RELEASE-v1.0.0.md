# v1.0.0 release audit

First public release of the offline Idle Hero Dungeon web game. Earlier internal version labels described development milestones; the public package and game UI now use v1.0.0.

## Verification on 2026-11-02

- Source checks and all 56 unit tests passed.
- Browser QA passed 36 desktop/mobile checks, including direct-file launch, save export/import, and no external runtime requests.
- Art, environment, combat, paused-world, and progression browser checks passed.
- A fresh-save browser journey completed automatic combat, hook consumption, camp reward, weapon upgrade, skill unlock, frost travel, actual boss victory, save reload, defeat, and meadow revive. No page errors occurred. The local `qa/journey.webm` recording and screenshots were reviewed; generated QA media stays outside source control.
- The local build declared version 1.0.0. All 24 files listed in `dist/build-info.json` matched their SHA-256 hashes and byte lengths.
- Actual desktop and portrait-mobile captures were inspected for readable controls, character and weapon art, environmental assets, and gameplay feedback.

## Limits

Champion and enemy art uses generated directional sprite atlases in a Three.js world, not the original game's meshes or animation clips. Browser saves remain scoped to their browser and origin; the settings export/import flow transfers progress. Chrome or Edge with WebGL is required.
