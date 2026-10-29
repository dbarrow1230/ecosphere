import {defineConfig,loadEnv} from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";
import {fileURLToPath} from "node:url";
import fs from "node:fs";

export function createPublicViteConfig(configUrl,appKey){
 const appDirectory=path.dirname(fileURLToPath(configUrl)),workspace=path.dirname(appDirectory);
 const runtime=JSON.parse(fs.readFileSync(path.join(workspace,"app-runtime-config.json"),"utf8"));
 return defineConfig(({mode})=>{
  const env=loadEnv(mode,appDirectory,"");
  const target=env.VITE_PUBLIC_API_URL||`http://${runtime.host}:${runtime.backends[appKey]}`;
  const directories=new Set(["logos","images","attachments","avatars",...(env.VITE_UPLOAD_DIRS||"").split(",").map(item=>item.trim()).filter(Boolean)]);
  const proxy={"/api":{target,changeOrigin:true}};for(const directory of directories)proxy[`/${directory}/`]={target,changeOrigin:true};
  return {root:path.join(appDirectory,"src","webpage"),envDir:appDirectory,plugins:[react()],resolve:{alias:{"@shared":path.join(workspace,"shared")},dedupe:["react","react-dom"]},build:{outDir:path.join(appDirectory,"dist-public"),emptyOutDir:true},server:{host:runtime.host,port:runtime.publicApplications[appKey],strictPort:true,open:false,fs:{allow:[workspace]},proxy}};
 });
}
