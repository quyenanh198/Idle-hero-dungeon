const http=require('node:http');
const fs=require('node:fs');
const path=require('node:path');
const root=__dirname,port=Number(process.env.PORT)||4177;
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json','.svg':'image/svg+xml','.txt':'text/plain','.ttf':'font/ttf','.png':'image/png','.mp4':'video/mp4','.webm':'video/webm'};
const server=http.createServer((req,res)=>{let name;try{name=decodeURIComponent(new URL(req.url,'http://localhost').pathname);}catch{res.writeHead(400);res.end();return;}const file=path.resolve(root,'.'+(name==='/'?'/index.html':name));if(!file.startsWith(root+path.sep)){res.writeHead(403);res.end();return;}fs.readFile(file,(err,data)=>{if(err){res.writeHead(404);res.end('Not found');return;}res.writeHead(200,{'Content-Type':types[path.extname(file)]||'application/octet-stream','Cache-Control':'no-cache','X-Content-Type-Options':'nosniff'});res.end(data);});});
server.listen(port,'127.0.0.1',()=>console.log(`Idle Hero Dungeon: http://localhost:${port}`));server.on('error',e=>{console.error(e.message);process.exit(1);});
