# Idle Hero Dungeon

A local desktop/mobile webapp inspired by the supplied gameplay recording. Rendered champion, weapon and enemy art runs over a Three.js world, with live chains, automatic combat, upgrades, skills, bounties and local saves.

## Play locally

Open **Play.cmd** or **index.html** in Chrome/Edge. The checked-in art bundle and vendored Three.js allow offline direct-file play. WebGL is required.

For localhost:

```sh
npm ci
npm run build
npm start
```

Open **http://localhost:4177**. The server listens only on this machine. Set `PORT` to choose another port. The distributable is generated in `dist/`; open `dist/Play.cmd` without installing runtime packages.

## Controls

- WASD / arrow keys, click the ground, or drag the touch joystick.
- Attacks happen automatically in range. AUTO BATTLE also walks toward enemies.
- Inventory equips up to six weapons; gold upgrades levels.
- Skills spend souls and enforce prerequisite nodes.
- Map travels between the meadow, frost region and ancient gate boss.
- Bounties reward gems; the shop offers weapon chests, healing and gem exchange using earned currency.
- Space pauses, Escape closes a panel, and the minimap + changes zoom.
- Settings controls sound, save export/import and a two-step reset.

Progress saves every five seconds and on page exit. Browser/origin saves are separate, so use export/import to transfer between file:// and localhost or between devices. Offline gold is capped at eight hours. Defeat revives the hero in the meadow without removing equipment.

## Verify

```sh
npm run check
npm test
npm run build
npx playwright install chromium
# Run npm start in another terminal first:
npm run test:browser
npm run test:art
```

The GitHub workflow runs source checks, unit tests, a build, browser flows and artwork/resource checks, then uploads screenshots and the local build as artifacts.

## Art and inspection

- `qa/asset-review.html`: live close-up champion and weapon animation viewer.
- `assets/art/`: original generated PNG atlases, pommel anchors and prompt specifications.
- `scripts/compile-art.cjs`: embeds textures as data URLs for direct-file WebGL compatibility.
- `scripts/build.cjs`: assembles and hashes the offline distributable.
- `docs/superpowers/plans/2026-11-01-continuation.md`: the current asset, combat and progression work sequence.

The champion has eight views and four idle/walk poses; six weapon heads and three animated enemy species share the rendered style. These assets were generated with the built-in ImageGen tool. They are reconstructed art, not original game meshes or animation clips.

Reference recordings, extracted phone screenshots, local saves, old backups and generated QA media are intentionally excluded from the repository. Source PNGs are retained. Three.js and Lilita One licenses are included in `vendor/`. The game makes no remote requests while playing.
