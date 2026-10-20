// Read-only source audit. Does not build, start servers, or connect to Mongo.
import fs from "node:fs";
import path from "node:path";
import {parse} from "@babel/parser";
const root=process.cwd();
const files=[];
function walk(dir){for(const entry of fs.readdirSync(dir,{withFileTypes:true})){
 const full=path.join(dir,entry.name);
 if(entry.isDirectory())walk(full);
 else if(/\.(jsx?|mjs)$/.test(entry.name))files.push(full);
}}
walk(path.join(root,"src"));walk(path.join(root,"backend"));
const issues=[];const imports=new Map();let syntaxErrors=0;
function resolve(from,spec){
 const base=spec.startsWith("@shared") ? path.resolve(root,"../shared",spec.slice(7).replace(/^\//,"")) : path.resolve(path.dirname(from),spec);
 return [base,...[".js",".jsx",".mjs","/index.js","/index.jsx"].map(ext=>base+ext)].find(file=>fs.existsSync(file)&&fs.statSync(file).isFile());
}
for(const file of files){
 const source=fs.readFileSync(file,"utf8");
 let ast;try{ast=parse(source,{sourceType:"module",plugins:["jsx"]});}catch(error){issues.push({file:path.relative(root,file),type:"syntax",message:error.message});syntaxErrors++;continue;}
 const dependencies=[];
 for(const node of ast.program.body){
  if(!node.source?.value)continue;
  const spec=node.source.value;
  if(spec.startsWith(".")||spec.startsWith("@shared")){
   const target=resolve(file,spec);
   if(!target)issues.push({file:path.relative(root,file),type:"missing import",message:spec});
   else dependencies.push(target);
  }
 }
 imports.set(file,dependencies);
}
const reachable=new Set();function visit(file){if(reachable.has(file))return;reachable.add(file);for(const dep of imports.get(file)||[])visit(dep);}
visit(path.join(root,"src/main.jsx"));visit(path.join(root,"backend/server.js"));
for(const issue of issues)issue.active=reachable.has(path.join(root,issue.file));
const app=fs.readFileSync(path.join(root,"src/App.jsx"),"utf8");
const routes=[...app.matchAll(/<Route\s+path="([^"]+)"/g)].map(match=>match[1]);
const matchesRoute=url=>routes.some(route=>route!=="*" && new RegExp("^"+route.replace(/:[^/]+/g,"[^/]+")+"/?$").test(url));
const brokenLinks=[];const endpoints=new Map();
for(const file of files.filter(file=>file.includes(path.sep+"src"+path.sep))){
 const source=fs.readFileSync(file,"utf8");
 for(const match of source.matchAll(/\bto=["'](\/[^"'#?]*)["']/g))if(!matchesRoute(match[1]))brokenLinks.push({file:path.relative(root,file),target:match[1],active:reachable.has(file)});
 for(const match of source.matchAll(/["'`](\/api\/[\w/-]+)/g)){
  const sources=endpoints.get(match[1])||[];sources.push(path.relative(root,file));endpoints.set(match[1],sources);
 }
}
const server=fs.readFileSync(path.join(root,"backend/server.js"),"utf8");
const mounts=[...server.matchAll(/app\.use\("(\/api[^" ]*)",(\w+)\)/g)].map(match=>({prefix:match[1],router:match[2]}));
const serverAst=parse(server,{sourceType:"module"});
const mountedRoutes=[];
for(const mount of mounts){
 const declaration=serverAst.program.body.find(node=>node.type==="ImportDeclaration" && node.specifiers.some(spec=>spec.local.name===mount.router));
 if(!declaration)continue;
 const routerFile=resolve(path.join(root,"backend/server.js"),declaration.source.value);
 if(!routerFile)continue;
 const source=fs.readFileSync(routerFile,"utf8");
 for(const match of source.matchAll(/router\.(get|post|put|patch|delete|route)\("([^"]+)"\)/g)){
  mountedRoutes.push({path:mount.prefix+(match[2]==="/" ? "" : match[2]),method:match[1],file:path.relative(root,routerFile)});
 }
}
const directApiPaths=[...server.matchAll(/app\.(?:get|post|put|patch|delete)\("(\/api[^" ]*)"/g)].map(match=>match[1]);
const unmountedApiCalls=[...endpoints].filter(([url])=>!mounts.some(mount=>url===mount.prefix||url.startsWith(mount.prefix+"/")) && !directApiPaths.some(route=>new RegExp("^"+route.replace(/:[^/]+/g,"[^/]+")+"$").test(url)))
 .map(([url,sources])=>({url,sources,active:sources.some(file=>reachable.has(path.join(root,file)))}));
const placeholders=[...app.matchAll(/<Route\s+path="([^"]+)"\s+element=\{<WorkflowPlaceholder/g)].map(match=>match[1]);
const report={filesChecked:files.length,syntaxErrors,routes,issues,brokenLinks,placeholders,mountedRoutes,unmountedApiCalls,endpoints:Object.fromEntries(endpoints)};
fs.writeFileSync(path.join(root,"docs/wiring-audit.json"),JSON.stringify(report,null,2)+"\n");
console.log(JSON.stringify({filesChecked:files.length,syntaxErrors,activeImportIssues:issues.filter(issue=>issue.active),inactiveImportIssueCount:issues.filter(issue=>!issue.active).length,brokenActiveLinks:brokenLinks.filter(link=>link.active)},null,2));
if(syntaxErrors || issues.some(issue=>issue.active))process.exitCode=1;
