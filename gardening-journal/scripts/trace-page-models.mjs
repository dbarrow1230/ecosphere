import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const server=fs.readFileSync(path.join(root,'backend/server.js'),'utf8');
const appFile=path.join(root,'src/App.jsx');
const app=fs.readFileSync(appFile,'utf8');
const resolve=(directory,name)=>[name,name+'.js',name+'.jsx',path.join(name,'index.js')].map(value=>path.resolve(directory,value)).find(value=>fs.existsSync(value)&&fs.statSync(value).isFile());
const imports=(file)=>{const source=fs.readFileSync(file,'utf8');return [...source.matchAll(/import\s+(?:([A-Za-z_$][\w$]*)|\{[^}]+\})\s+from\s+["']([^"']+)["']/g)].map(match=>({name:match[1],source:match[2],file:match[2].startsWith('.')?resolve(path.dirname(file),match[2]):null}));};
const serverImports=imports(path.join(root,'backend/server.js'));
const appImports=imports(appFile);
const pages=[...app.matchAll(/<Route\s+path="([^"]+)"\s+element=\{<([\w]+)/g)].map(match=>({route:match[1],label:match[2],file:appImports.find(item=>item.name===match[2])?.file,redirect:match[2]==='Navigate'}));
const mounts=[...server.matchAll(/app\.use\(["'](\/api[^"']*)["']\s*,\s*([\w]+)/g)].map(match=>({endpoint:match[1],router:serverImports.find(item=>item.name===match[2])?.file}));
function modelsFor(router){
 if(!router)return [];
 const models=new Map();
 const visited=new Set();
 function visit(file){
 if(visited.has(file))return;
 visited.add(file);
 for(const item of imports(file).filter(item=>item.file)){
 if(!item.source.includes('models')){if(item.file.includes(path.join(root,'backend')))visit(item.file);continue;}
  const source=fs.readFileSync(item.file,'utf8');
  models.set(item.file,{name:item.name||path.basename(item.file),file:path.relative(root,item.file).replaceAll('\\','/'),collection:source.match(/collection\s*:\s*["']([^"']+)["']/)?.[1]||null,connection:/businessInfoConnection/.test(source)?'business':'gardening'});
 }
 }
 visit(router);
 return [...models.values()];
}
function pageRequests(file,visited=new Set()){
 if(!file||visited.has(file))return [];
 visited.add(file);
 const source=fs.readFileSync(file,'utf8');
 const requests=[...source.matchAll(/["'`](\/api\/[^"'`\s]*)/g)].map(match=>match[1].split('${')[0].split('?')[0].replace(/\/$/,''));
 for(const item of imports(file))if(item.file&&!item.file.includes('node_modules'))requests.push(...pageRequests(item.file,visited));
 return [...new Set(requests)];
}
const results=pages.map(page=>{
 const file=page.file;
 const requests=pageRequests(file);
 return {route:page.route,page:page.label,redirect:page.redirect,file:file?path.relative(root,file).replaceAll('\\','/'):null,displayVerification:'pending',requests:requests.map(endpoint=>{
  const mount=mounts.filter(item=>endpoint===item.endpoint||endpoint.startsWith(item.endpoint+'/')).sort((a,b)=>b.endpoint.length-a.endpoint.length)[0];
  return {endpoint,router:mount?.router?path.relative(root,mount.router).replaceAll('\\','/'):null,models:modelsFor(mount?.router)};
 })};
});
const report={checkedAt:new Date().toISOString(),pages:results,limitations:['This traces source routes and model connections; it does not claim every workflow passed.','Related lookup models are listed separately from page records.','Missing stored HydroSystem records cannot be replaced with equipment or location records.','Manual SeedCollection entries cannot be replaced with Seed packet counts.']};
fs.writeFileSync(path.join(root,'docs/audits/page-model-trace.json'),JSON.stringify(report,null,2));
console.log(JSON.stringify({pages:results.length,pagesWithModelRoutes:results.filter(page=>page.requests.some(request=>request.models.length)).length,unresolved:[...new Set(results.flatMap(page=>page.requests.filter(request=>!request.router).map(request=>request.endpoint)))]}));
