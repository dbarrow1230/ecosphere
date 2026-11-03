import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const base=process.env.GARDEN_AUDIT_URL||'http://127.0.0.1:5186';
const app=fs.readFileSync(path.join(root,'src/App.jsx'),'utf8');
const server=fs.readFileSync(path.join(root,'backend/server.js'),'utf8');
const paths=[...new Set([...app.matchAll(/<Route\s+path="([^" ]+)"/g)].map(match=>match[1]))];
const mounts=[...new Set([...server.matchAll(/app\.use\(["'](\/api[^"']*)["']/g)].map(match=>match[1]))];
const pages=[];
for(const route of paths.filter(route=>!route.includes(':')&&route!=='*')){
 const response=await fetch(base+route,{headers:{Accept:'text/html'},signal:AbortSignal.timeout(10000)});
 pages.push({route,status:response.status,html:response.headers.get('content-type')?.includes('text/html')});
}
const apis=[];
for(const endpoint of mounts){
 const response=await fetch(base+endpoint,{signal:AbortSignal.timeout(10000)});
 const body=await response.json().catch(()=>null);
 apis.push({endpoint,status:response.status,count:Array.isArray(body)?body.length:Array.isArray(body?.data)?body.data.length:undefined,error:response.status>=500?body?.message||'Server error':undefined});
}
const failures=[...pages.filter(page=>page.status!==200||!page.html),...apis.filter(api=>api.status>=500)];
const report={checkedAt:new Date().toISOString(),pageRouteCount:paths.length,pages,apis,failures,limitations:['HTTP route checks verify SPA delivery; browser rendering was checked separately.','Router roots that require a subpath or query parameters may return 400 or 404.','Authenticated workflows and password-reset submission require a valid user session or reset token.','Read-only checks do not create, edit, or delete user records.']};
fs.mkdirSync(path.join(root,'docs/audits'),{recursive:true});
fs.writeFileSync(path.join(root,'docs/audits/data-display-live.json'),JSON.stringify(report,null,2));
console.log(JSON.stringify({routes:paths.length,httpPagesChecked:pages.length,apiRootsChecked:apis.length,failures}));
if(failures.length)process.exitCode=1;
