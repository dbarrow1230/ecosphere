import fs from "node:fs";
import path from "node:path";
const root=process.cwd();
const files=[];
function walk(folder){for(const entry of fs.readdirSync(folder,{withFileTypes:true})){const file=path.join(folder,entry.name);if(entry.isDirectory())walk(file);else if(/\.[jt]sx?$/.test(file))files.push(path.resolve(file));}}
walk("src");
const fileSet=new Set(files),dependencies=new Map();
const externalImports=new Set();
for(const file of files){
 const source=fs.readFileSync(file,"utf8");
 const imports=[...source.matchAll(/(?:from\s*|import\s*\(|import\s*)["']([^"']+)["']/g)].map(match=>match[1]).filter(value=>value.startsWith("."));
 dependencies.set(file,imports.map(value=>{const base=path.resolve(path.dirname(file),value);const candidate=[base,base+".jsx",base+".js",path.join(base,"index.jsx"),path.join(base,"index.js")].find(item=>fileSet.has(item));if(!candidate&&!base.startsWith(path.resolve("src")+path.sep))externalImports.add(base);return candidate;}).filter(Boolean));
}
const reachable=new Set();
function visit(file){if(reachable.has(file))return;reachable.add(file);for(const dependency of dependencies.get(file)||[])visit(dependency);}
for(const file of files.filter(file=>path.dirname(file)===path.resolve("src")&&/[/\\](main|index)\.[jt]sx?$/.test(file)))visit(file);
const relative=file=>path.relative(root,file).replaceAll("\\","/");
const app=fs.readFileSync("src/App.jsx","utf8");
const routes=[...app.matchAll(/<Route\s+path="([^"]+)"\s+element=\{<([A-Za-z0-9_]+)([^>]*)/g)].map(match=>({path:match[1],component:match[2],...(match[2]==="Navigate"?{redirect:match[3].match(/to="([^"]+)"/)?.[1]}:{})}));
const mounts=[...fs.readFileSync("backend/server.js","utf8").matchAll(/app\.use\("(\/api[^" ]*)",([^;)]+)/g)].map(match=>({path:match[1],handler:match[2].trim()}));
const result={sourceFiles:files.length,reachableFiles:reachable.size,unreachable:files.filter(file=>!reachable.has(file)).map(relative),routes,apiMounts:mounts,sharedImports:[...externalImports].map(relative),limitations:"Static local import and route analysis. Shared applications, runtime authorization, database contents and live browser behavior require separate verification."};
fs.mkdirSync("docs/audits",{recursive:true});
fs.writeFileSync("docs/audits/application-current.json",JSON.stringify(result,null,2));
console.log(JSON.stringify({sourceFiles:result.sourceFiles,reachableFiles:result.reachableFiles,unreachableFiles:result.unreachable.length,routes:routes.length,apiMounts:mounts.length},null,2));
