const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const root = path.join(__dirname, 'public');
const types = {'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.png':'image/png','.jpg':'image/jpeg','.svg':'image/svg+xml','.ico':'image/x-icon'};
http.createServer((req,res)=>{
 if(!['GET','HEAD'].includes(req.method)){res.writeHead(405);return res.end();}
 let url;try{url=decodeURIComponent(new URL(req.url,'http://localhost').pathname);}catch{res.writeHead(400);return res.end();}
 const host=(req.headers.host||'').split(':')[0].toLowerCase();
 const instituteHost=host==='institute.shambasana.com';
 if(instituteHost){
  if(url==='/')url='/institute/';
  else if(url==='/index.html')url='/institute/index.html';
  else if(url!=='/health'&&!url.startsWith('/institute/')&&!url.startsWith('/assets/'))url=path.posix.join('/institute',url);
 }
 let file=path.resolve(root,'.'+url);
 if(file!==root&&!file.startsWith(root+path.sep)){res.writeHead(403);return res.end();}
 if(url==='/health'){res.writeHead(200,{'Content-Type':'text/plain'});return res.end('ok');}
 if(fs.existsSync(file)&&fs.statSync(file).isDirectory())file=path.join(file,'index.html');
 fs.readFile(file,(error,data)=>{
  if(error){res.writeHead(404);return res.end('Not found');}
  res.writeHead(200,{'Content-Type':types[path.extname(file)]||'application/octet-stream','X-Content-Type-Options':'nosniff'});
  res.end(req.method==='HEAD'?undefined:data);
 });
}).listen(Number(process.env.PORT)||3000,'0.0.0.0',()=>console.log('Shamba Sana server ready'));

