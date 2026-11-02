const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { spawnSync } = require('node:child_process');

const root = path.resolve(__dirname, '..');
const output = path.join(root, 'dist');
const { version } = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
const files = [
  'index.html', 'styles.css', 'core.js', 'world.js', 'game.js',
  'assets/art/weapons-v3.png', 'motion.js', 'characters.js', 'art-assets.js', 'sprite-motion.js', 'art-renderer.js', 'reference.css', 'server.cjs', 'Play.cmd', 'vendor/three.min.js', 'vendor/THREE-LICENSE.txt', 'vendor/lilita-one.ttf', 'vendor/LILITA-LICENSE.txt'
];

for (const file of ['core.js', 'world.js', 'game.js', 'motion.js', 'characters.js', 'sprite-motion.js', 'art-renderer.js', 'server.cjs']) {
  const result = spawnSync(process.execPath, ['--check', path.join(root, file)], { stdio: 'inherit' });
  if (result.status !== 0) process.exit(result.status || 1);
}

require('./compile-art.cjs');
const manifest = {};
for (const file of files) {
  const source = path.join(root, file);
  const destination = path.join(output, file);
  const data = fs.readFileSync(source);
  fs.mkdirSync(path.dirname(destination), { recursive: true });
  fs.writeFileSync(destination, data);
  manifest[file] = { bytes: data.length, sha256: crypto.createHash('sha256').update(data).digest('hex') };
}

fs.writeFileSync(path.join(output, 'package.json'), JSON.stringify({
  name: 'idle-hero-dungeon-local', version, private: true,
  scripts: { start: 'node server.cjs' }
}, null, 2) + '\n');
fs.writeFileSync(path.join(output, 'README.txt'),
  'IDLE HERO DUNGEON - LOCAL BUILD\r\n\r\n' +
  'Double-click Play.cmd or open index.html in Chrome/Edge.\r\n' +
  'No installation or internet connection required. WebGL is required.\r\n\r\n' +
  'Optional HTTP mode: with Node.js installed, run npm start in this folder.\r\n' +
  'Open http://localhost:4177\r\n\r\n' +
  'Desktop: WASD/arrows or click the ground. Mobile: touch joystick.\r\n' +
  'Progress saves to this browser. Settings has save export/import.\r\n' +
  'file:// and localhost have separate saves; export/import to transfer.\r\n');
fs.writeFileSync(path.join(output, 'build-info.json'), JSON.stringify({
  name: 'Idle Hero Dungeon', version, builtAt: new Date().toISOString(), files: manifest
}, null, 2) + '\n');
console.log(`Local build ready: ${output}`);
console.log(`${files.length} runtime files; no runtime installation required.`);
