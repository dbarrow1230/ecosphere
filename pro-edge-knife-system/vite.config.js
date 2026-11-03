import {defineConfig,loadEnv} from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import {fileURLToPath} from "url";

const __filename=fileURLToPath(import.meta.url);
const __dirname=path.dirname(__filename);
const sharedDirectory=path.resolve(__dirname,"..","shared");

export default defineConfig(({mode})=>{
 const env=loadEnv(mode,process.cwd(),"");
 const backendUrl=env.VITE_BACKEND_URL||"http://127.0.0.1:6018";
 return {
  plugins:[react()],
  resolve:{dedupe:["react","react-dom"],alias:{"@shared":sharedDirectory}},
  optimizeDeps:{include:["react","react-dom","react-router-dom"]},
  server:{host:true,strictPort:true,fs:{allow:[path.resolve(__dirname,".."),sharedDirectory]},proxy:{"/api":{target:backendUrl,changeOrigin:true,secure:false},"/images":{target:backendUrl,changeOrigin:true,secure:false}}}
 };
});
