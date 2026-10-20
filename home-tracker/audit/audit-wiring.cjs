const fs=require('fs');
const path=require('path');
const parser=require('@babel/parser');
const root=path.resolve(__dirname,'..');
const walk=d=>fs.readdirSync(d,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(d,e.name)):[path.join(d,e.name)]);
const files=['src','backend'].flatMap(d=>walk(path.join(root,d))).filter(f=>/\.(js|jsx)$/.test(f));
const graph=new Map(),missing=[],syntaxErrors=[];
const resolve=(f,s)=>{const target=s==='@shared'?path.resolve(root,'../shared/index.js'):s.startsWith('@shared/')?path.resolve(root,'../shared',s.slice(8)):s.startsWith('.')?path.resolve(path.dirname(f),s):null;if(!target)return null;return ['','.js','.jsx','/index.js','/index.jsx'].map(ext=>target+ext).find(p=>fs.existsSync(p)&&fs.statSync(p).isFile())||false;};
const visit=f=>{if(graph.has(f))return;graph.set(f,[]);try{const ast=parser.parse(fs.readFileSync(f,'utf8'),{sourceType:'module',plugins:['jsx']});for(const n of ast.program.body){if(!n.source)continue;const s=n.source.value,target=resolve(f,s);if(target===false)missing.push({file:path.relative(root,f),import:s});if(target&&/\.(js|jsx)$/.test(target)){graph.get(f).push(target);visit(target);}}}catch(e){syntaxErrors.push({file:path.relative(root,f),error:e.message});}};
files.forEach(visit);
const reachable=start=>{const seen=new Set();const go=f=>{if(seen.has(f))return;seen.add(f);(graph.get(f)||[]).forEach(go);};go(path.resolve(root,start));return seen;};
const front=reachable('src/main.jsx'),back=reachable('backend/server.js');
const server=fs.readFileSync(path.join(root,'backend/server.js'),'utf8');
const apiMounts=[...server.matchAll(/app\.(?:use|get|post|put|delete)\("(\/api[^\"]+)"/g)].map(m=>m[1]);
const frontendRoutes=[...fs.readFileSync(path.join(root,'src/App.jsx'),'utf8').matchAll(/<Route path="([^"]+)"/g)].map(m=>m[1]);
const links=[];for(const f of front){const text=fs.readFileSync(f,'utf8');for(const m of text.matchAll(/(?:to=|to:)"(\/[^"?]*)"/g)){if(!frontendRoutes.includes(m[1]))links.push({file:path.relative(root,f),path:m[1]});}}
const endpointReferences=[];for(const f of files.filter(f=>f.includes(path.sep+'src'+path.sep))){const text=fs.readFileSync(f,'utf8');for(const m of text.matchAll(/["'`](\/api\/[^"'`\s]*)/g)){const url=m[1].split('?')[0].split('${')[0];endpointReferences.push({file:path.relative(root,f),active:front.has(f),url,mountExists:apiMounts.some(p=>p.includes(':')?new RegExp('^'+p.replace(/:[^/]+/g,'[^/]+')+'$').test(url):url===p||url.startsWith(p+'/'))});}}
const report={scannedFiles:files.length,reachableFrontendFiles:front.size,reachableBackendFiles:back.size,syntaxErrors,missingImports:missing.map(m=>({...m,active:front.has(path.resolve(root,m.file))||back.has(path.resolve(root,m.file))})),apiMounts,frontendRoutes,unmatchedStaticLinks:links,endpointReferences};
fs.writeFileSync(path.join(__dirname,'static-audit.json'),JSON.stringify(report,null,2));
console.log(JSON.stringify({scannedFiles:files.length,syntaxErrors,missingImports:missing.length,activeMissingImports:report.missingImports.filter(m=>m.active),unmatchedStaticLinks:links,unmountedEndpoints:endpointReferences.filter(e=>!e.mountExists)},null,2));
if(syntaxErrors.length||report.missingImports.some(m=>m.active))process.exitCode=1;
