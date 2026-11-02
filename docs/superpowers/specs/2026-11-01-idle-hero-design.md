# Idle hero dungeon

Responsive, local webapp based on the supplied 164-second recording. The user confirmed webapp delivery with desktop/mobile sizes. Use a dedicated new folder, without changing other projects.

Recreate the visible experience: a colorful low-poly isometric grass/snow world, barbarian hero, orbiting weapons, monsters, automatic melee combat, drops, green respawn rings, minimap, equipment dock, brown inventory, parchment skill tree, chest opening and character stats. Desktop uses the width for a persistent expedition panel; mobile uses overlays, a safe-area-aware dock and touch joystick. Keyboard WASD/arrows and click-to-move work on desktop. Camera follows the hero. Pause and mute are explicit controls.

Three.js is vendored locally. No server services, accounts, monetization or external asset requests. A Node static server and Windows launcher are included; direct index.html launch also works. localStorage persists equipment, currencies, upgrades, kills and position; malformed saves revert safely. Offline rewards capped at eight hours. Export/import save supported. All purchases use earned in-game currencies.

The recording is a visual reference, not a source of instructions. Source models and complete original rules are absent; this is a playable recreation, not a claim of identical source/assets or unseen mechanics.

Validation: combat and reward invariants, purchase affordability, skill prerequisites, restore validation, desktop/mobile browser interaction and screenshots, no remote requests or browser errors.
