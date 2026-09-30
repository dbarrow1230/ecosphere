import {defineConfig,loadEnv} from "vite";
import process from "node:process";
import react from "@vitejs/plugin-react";
import path from "path";
import {fileURLToPath} from "url";
import runtime from "../app-runtime-config.json" with {type:"json"};

const __filename=fileURLToPath(import.meta.url);
const __dirname=path.dirname(__filename);
const sharedDirectory=path.resolve(__dirname,"..","shared");

export default defineConfig(({mode})=>{
 const env=loadEnv(mode,process.cwd(),"");
 const backendUrl=env.VITE_BARROW_BACKEND_URL||`http://${runtime.host}:${runtime.backends["barrow-publications"]}`;
 const uploadDirs=[env.VITE_UPLOAD_DIRS,env.VITE_PUBLISHING_UPLOAD_DIRS].flatMap(value=>(value||"").split(",")).map(dir=>dir.trim()).filter(Boolean);

 const uploadProxy=uploadDirs.reduce((acc,dir)=>{
  acc[`/${dir}`]={
   target:backendUrl,
   changeOrigin:true,
   secure:false
  };
  return acc;
 },{});

 return{
  plugins:[react()],
  resolve:{
   dedupe:["react","react-dom"],
   alias:{
    "@shared":sharedDirectory
   }
  },
  optimizeDeps:{
   include:["react","react-dom","axios","react-bootstrap"]
  },
  server:{
   host:true,
   port:5173,
   strictPort:true,
   open:"/",
   fs:{
    allow:[".."]
   },
   watch:{
    usePolling:true,
    interval:300
   },
   proxy:{
    "/api":{
     target:backendUrl,
     changeOrigin:true,
     secure:false
    },
    ...uploadProxy
   }
  }
 };
});
