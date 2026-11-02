const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),specs={champion:{file:'champion-v3.png',columns:8,rows:4},weapons:{file:'weapons-v3.png',columns:3,rows:2},enemies:{file:'enemies-v3.png',columns:4,rows:3}},art={};
for(const [name,spec]of Object.entries(specs)){
 const bytes=fs.readFileSync(path.join(root,'assets/art',spec.file));
 if(bytes.subarray(1,4).toString()!=='PNG')throw Error('Art must be PNG: '+spec.file);
 art[name]={columns:spec.columns,rows:spec.rows,width:bytes.readUInt32BE(16),height:bytes.readUInt32BE(20),data:'data:image/png;base64,'+bytes.toString('base64')};
}
art.weapons.anchors=JSON.parse(fs.readFileSync(path.join(root,'assets/art/anchors.json'),'utf8'));
fs.writeFileSync(path.join(root,'art-assets.js'),'/* Bundled raster art: data URLs preserve direct-file offline play. */\nwindow.HeroArt='+JSON.stringify(art)+';\n');
console.log('Bundled champion, weapon and enemy atlases for offline play.');
