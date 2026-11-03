import {defineConfig,loadEnv} from "vite";
import react from "@vitejs/plugin-react";
import {fileURLToPath} from "node:url";
const appDirectory=fileURLToPath(new URL(".",import.meta.url));
export default defineConfig(({mode})=>{
 const env=loadEnv(mode,appDirectory,"");
 const target=env.VITE_PUBLIC_API_URL||"http://127.0.0.1:6039";
 const assetDirectories=new Set(["logos","images","attachments",...(env.VITE_UPLOAD_DIRS||"").split(",").map(value=>value.trim()).filter(Boolean)]);
 const proxy={"/api":{target,changeOrigin:true}};
 for(const directory of assetDirectories)proxy[`/${directory}`]={target,changeOrigin:true};
 return {root:fileURLToPath(new URL("./src/webpage",import.meta.url)),envDir:appDirectory,plugins:[react()],optimizeDeps:{include:["react","react-dom/client","lucide-react"]},resolve:{dedupe:["react","react-dom"]},build:{outDir:fileURLToPath(new URL("./dist-public",import.meta.url)),emptyOutDir:true},server:{host:"127.0.0.1",port:5214,strictPort:true,proxy}};
});
