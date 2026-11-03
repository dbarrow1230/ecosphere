import {defineConfig,loadEnv} from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import {fileURLToPath} from "url";

const __filename=fileURLToPath(import.meta.url);
const __dirname=path.dirname(__filename);
const sharedDirectory=path.resolve(__dirname,"..","shared");

export default defineConfig(({mode})=>{
 const env=loadEnv(mode,process.cwd(),"");
 const backendUrl=env.VITE_BACKEND_URL||"http://127.0.0.1:6022";
 const uploadDirs=(env.VITE_UPLOAD_DIRS||"").split(",").map(dir=>dir.trim()).filter(Boolean);

 const uploadProxy=uploadDirs.reduce((acc,dir)=>{
  acc[`/${dir}`]={target:backendUrl,changeOrigin:true,secure:false};
  return acc;
 },{});

 return{
  cacheDir:"node_modules/.vite-management",
  plugins:[react()],
  resolve:{
   dedupe:["react","react-dom"],
   alias:{"@shared":sharedDirectory}
  },
  optimizeDeps:{
   include:["react","react-dom","axios","react-bootstrap"]
  },
  server:{
   fs:{
    allow:[".."]
   },
   host:true,
   port:5196,
   strictPort:true,
   open:false,
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