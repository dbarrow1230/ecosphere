import fs from 'node:fs';
import path from 'node:path';
import * as espree from 'espree';

const walk=dir=>fs.readdirSync(dir,{withFileTypes:true}).flatMap(entry=>entry.isDirectory()?walk(path.join(dir,entry.name)):[path.join(dir,entry.name)]);
const files=[...walk('src'),...walk('backend')].filter(file=>/\.(jsx?|css)$/.test(file));
const sources=new Map(files.map(file=>[file.replaceAll('\\','/'),fs.readFileSync(file,'utf8')]));
const resolve=(file,specifier)=>{
 const base=path.resolve(path.dirname(file),specifier.startsWith('@shared')?path.relative(path.dirname(file),path.resolve('../shared',specifier.slice(8))):specifier);
 return [base,base+'.js',base+'.jsx',path.join(base,'index.js'),path.join(base,'index.jsx')].find(candidate=>fs.existsSync(candidate)&&fs.statSync(candidate).isFile());
};
const imports=[],parseErrors=[],apiReferences=[],links=[];
for(const [file,source] of sources){
 if(!/\.jsx?$/.test(file))continue;
 try{
  const ast=espree.parse(source,{ecmaVersion:'latest',sourceType:'module',ecmaFeatures:{jsx:true},loc:true});
  for(const item of ast.body){
   if(!item.source)continue;
   const specifier=item.source.value;
   if(!specifier.startsWith('.')&&!specifier.startsWith('@shared'))continue;
   const target=resolve(file,specifier);
   imports.push({file,specifier,target:target?path.relative(process.cwd(),target).replaceAll('\\','/'):null});
  }
 }catch(error){parseErrors.push({file,message:error.message});}
 for(const match of source.matchAll(/["'`]((?:\/api\/)[^"'`\s]*)/g))apiReferences.push({file,path:match[1]});
 for(const match of source.matchAll(/(?:to\s*[=:]\s*|navigate\(\s*)["'](\/[^"']*)/g))links.push({file,path:match[1]});
}
const server=sources.get('backend/server.js');
const mounts=[...server.matchAll(/app\.use\("(\/api[^" ]*)",(\w+)\)/g)].map(match=>({path:match[1],router:match[2]}));
const routes=[...sources.get('src/App.jsx').matchAll(/<Route path="([^"]+)"/g)].map(match=>match[1]);
const reachable=new Set();
function visit(file){if(reachable.has(file))return;reachable.add(file);for(const item of imports.filter(item=>item.file===file&&item.target))visit(item.target);}
visit('src/main.jsx');visit('backend/server.js');
const report={sourceFiles:files.length,routes,mounts,parseErrors,missingImports:imports.filter(item=>!item.target).map(item=>({...item,active:reachable.has(item.file)})),unmatchedLinks:links.filter(item=>!routes.includes(item.path)&&!routes.some(route=>route.includes(':')&&item.path.startsWith(route.split(':')[0]))),unmountedApiReferences:apiReferences.filter(item=>!mounts.some(mount=>item.path===mount.path||item.path.startsWith(mount.path+'/')||item.path.startsWith(mount.path+'?'))&&!item.path.startsWith('/api/upload/')),unmountedRouteFiles:[...sources.keys()].filter(file=>file.startsWith('backend/routes/')&&!reachable.has(file)),unreachableFrontendFiles:[...sources.keys()].filter(file=>file.startsWith('src/')&&file.endsWith('.jsx')&&!reachable.has(file))};
fs.mkdirSync('audit',{recursive:true});
fs.writeFileSync('audit/wiring.json',JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({sourceFiles:report.sourceFiles,routes:routes.length,mounts:mounts.length,parseErrors,missingImports:report.missingImports,unmatchedLinks:report.unmatchedLinks,unmountedApiReferences:report.unmountedApiReferences},null,2));
