import {defineConfig,loadEnv} from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import {fileURLToPath} from "url";

const __filename=fileURLToPath(import.meta.url);
const __dirname=path.dirname(__filename);

export default defineConfig(({mode})=>{
 const env=loadEnv(mode,process.cwd(),"");
 const backendUrl=env.VITE_BACKEND_URL||"http://localhost:3001";
 const uploadDirs=(env.VITE_UPLOAD_DIRS||"").split(",").map(dir=>dir.trim()).filter(Boolean);

 const uploadProxy=uploadDirs.reduce((acc,dir)=>{
  const escaped=dir.replace(/[.*+?^${}()|[\]\\]/g,"\\$&");
  acc[`^/${escaped}/.+`]={target:backendUrl,changeOrigin:true,secure:false};
  return acc;
 },{});

 return{
  plugins:[react(),{
   name:"employee-upload-route-boundaries",
   configResolved(config){
    // EcoSphere can supply inline proxies; normalize those as well as this config.
    const proxy=config.server.proxy||{};
    for(const key of Object.keys(proxy)){
     if(!/^\/[^/]+$/.test(key)||["/api","/socket.io"].includes(key))continue;
     const target=proxy[key];
     delete proxy[key];
     const escaped=key.replace(/[.*+?^${}()|[\]\\]/g,"\\$&");
     proxy[`^${escaped}/.+`]=target;
    }
   }
  }],
  resolve:{
   dedupe:["react","react-dom"],
   alias:{"@shared":path.resolve(__dirname,"../shared")}
  },
  optimizeDeps:{
   include:["react","react-dom","axios","react-bootstrap"]
  },
  server:{
   fs:{
    allow:[".."]
   },
   host:true,
   open:true,
   watch:{
    usePolling:true,
    interval:300
   },
   proxy:{
    "/api":{target:backendUrl,changeOrigin:true,secure:false},
    ...uploadProxy
   }
  }
 };
});
