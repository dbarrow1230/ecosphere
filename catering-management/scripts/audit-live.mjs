import fs from 'node:fs';

// GET existing APIs only. Store status/count summaries without copying database records.
const server=fs.readFileSync('backend/server.js','utf8');
const runtimePath='../app-runtime-config.json';
const runtime=fs.existsSync(runtimePath)?JSON.parse(fs.readFileSync(runtimePath,'utf8')):null;
const baseUrl=runtime?.backends?.['catering-management']?`http://${runtime.host||'127.0.0.1'}:${runtime.backends['catering-management']}`:'http://localhost:3001';
const paths=['/api/health',...server.matchAll(/app\.use\("(\/api[^" ]*)",\w+\)/g)].map(value=>typeof value==='string'?value:value[1]);
const results=[];
for(let i=0;i<paths.length;i+=8){
 results.push(...await Promise.all(paths.slice(i,i+8).map(async path=>{
  try{
   const response=await fetch(`${baseUrl}${path}`,{signal:AbortSignal.timeout(5000)});
   const data=await response.json().catch(()=>null);
   const arrays=data&&typeof data==='object'?Object.entries(data).filter(([,value])=>Array.isArray(value)):[];
   return {path,status:response.status,arrays:Object.fromEntries(arrays.map(([key,value])=>[key,value.length])),...(response.ok?{}:{message:data?.message||'Request failed'})};
  }catch(error){return {path,error:error.cause?.code||error.name};}
 })));
}
fs.mkdirSync('audit',{recursive:true});
fs.writeFileSync('audit/live.json',JSON.stringify({checkedAt:new Date().toISOString(),baseUrl,method:'GET only',results},null,2)+'\n');
console.log(JSON.stringify({baseUrl,checked:results.length,passed:results.filter(result=>result.status===200).length,other:results.filter(result=>result.status!==200)},null,2));
