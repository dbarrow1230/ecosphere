import {spawn,spawnSync} from "node:child_process";
import {createRequire} from "node:module";
import fs from "node:fs";
import path from "node:path";
const root=path.resolve(import.meta.dirname,"../..");
let business="";
const json=async url=>{const response=await fetch(url,{signal:AbortSignal.timeout(15000)});if(!response.ok)throw new Error(`HTTP ${response.status}: ${new URL(url).pathname}`);return response.json();};
for(const [index,project]of ["recipe-management","recipe-costing","menus","catering-management"].entries()){
 const cwd=path.join(root,project);const require=createRequire(path.join(cwd,"package.json"));const packageFile=require.resolve("@dotenvx/dotenvx/package.json");const cli=path.resolve(path.dirname(packageFile),JSON.parse(fs.readFileSync(packageFile,"utf8")).bin.dotenvx);
 const port=16197+index;const base=`http://127.0.0.1:${port}`;
 const child=spawn(process.execPath,[cli,"run","--env-file","backend/.env","--",process.execPath,"backend/server.js"],{cwd,env:{...process.env,PORT:String(port),USDA_API_KEY:""},windowsHide:true,stdio:["ignore","pipe","pipe"]});
 let logs="";child.stdout.on("data",chunk=>{logs+=chunk;});child.stderr.on("data",chunk=>{logs+=chunk;});
 try{
  let ready=false;for(let attempt=0;attempt<60;attempt++){if(child.exitCode!==null)throw new Error(`${project}: backend exited ${child.exitCode}`);try{const health=await json(`${base}/api/health`);if(health.status==="ok"){ready=true;break;}}catch{}await new Promise(resolve=>setTimeout(resolve,500));}
  if(!ready)throw new Error(`${project}: startup timed out`);
  if(!business){const rows=await json(`${base}/api/recipes`);const recipe=(Array.isArray(rows)?rows:rows.data||rows.recipes||[])[0];business=String(recipe?.business?._id||recipe?.business||"");if(!business){const data=await json(`${base}/api/businesses`);business=String((Array.isArray(data)?data:data.businesses||data.data||[])[0]?._id||"");}}
  if(!business)throw new Error("No business record is available for read-only smoke tests.");
  const options=await json(`${base}/api/culinary/options?business=${business}`);const costs=await json(`${base}/api/culinary/cost-review?business=${business}`);
  const summary={project,health:"ok",recipes:options.recipes.length,costReviews:costs.length,offers:options.offers.length,menus:options.menus.length};
  if(options.recipes[0]){const assessment=await json(`${base}/api/culinary/recipes/${options.recipes[0]._id}/allergens?business=${business}`);summary.allergenAssessment=Array.isArray(assessment.risks)?"ok":"invalid";}
  if(options.offers[0]){const history=await json(`${base}/api/culinary/prices/${options.offers[0]._id}/history?business=${business}`);summary.priceHistory=history.versions.length;}
  console.log(JSON.stringify(summary));
 }finally{
  if(child.exitCode===null){if(process.platform==="win32")spawnSync("taskkill",["/PID",String(child.pid),"/T","/F"],{windowsHide:true,stdio:"ignore"});else child.kill("SIGTERM");}
 }
}
