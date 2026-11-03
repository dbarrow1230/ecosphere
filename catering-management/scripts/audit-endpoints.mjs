import fs from 'node:fs';
import mongoose from 'mongoose';

mongoose.createConnection=()=>new mongoose.Connection(mongoose);
const server=fs.readFileSync('backend/server.js','utf8');
const imports=new Map([...server.matchAll(/import\s+(\w+)\s+from\s+"(\.\/routes\/[^" ]+)"/g)].map(match=>[match[1],match[2]]));
const endpoints=[{path:'/api/health',methods:['get']}];
for(const mount of server.matchAll(/app\.use\("(\/api[^" ]*)",(\w+)\)/g)){
 const {default:router}=await import('../backend/'+imports.get(mount[2]).slice(2));
 for(const layer of router.stack){
  if(!layer.route)continue;
  for(const path of [layer.route.path].flat())endpoints.push({path:mount[1]+(path==='/'?'':path),methods:Object.keys(layer.route.methods)});
 }
}
const wiring=JSON.parse(fs.readFileSync('audit/wiring.json','utf8'));
const inactive=new Set(wiring.unreachableFrontendFiles);
const unmatched=[];
const walk=dir=>fs.readdirSync(dir,{withFileTypes:true}).flatMap(entry=>entry.isDirectory()?walk(`${dir}/${entry.name}`):[`${dir}/${entry.name}`]);
for(const file of walk('src').filter(file=>/\.jsx?$/.test(file))){
 if(inactive.has(file))continue;
 const source=fs.readFileSync(file,'utf8');
 for(const match of source.matchAll(/["'`]((?:\/api\/)[^"'`\s]*)/g)){
  const path=match[1].replace(/\$\{[^}]+\}/g,'audit-id').split('?')[0];
  const matches=endpoints.filter(endpoint=>{
   const pattern=endpoint.path.split('/').map(part=>part.startsWith(':')?'[^/]+':part.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')).join('/');
   return new RegExp(`^${pattern}/?$`).test(path);
  });
  if(!matches.length&&!path.startsWith('/api/upload/'))unmatched.push({file,path:match[1]});
 }
}
const report={endpoints,unmatchedActiveReferences:unmatched,limitations:['Checks URL shape, not HTTP method or dynamic variable API bases. Shared culinary router is outside this workspace.']};
fs.writeFileSync('audit/endpoints.json',JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({endpoints:endpoints.length,unmatchedActiveReferences:unmatched},null,2));
