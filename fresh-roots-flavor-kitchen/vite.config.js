import {defineConfig} from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import {fileURLToPath} from "url";

const __filename=fileURLToPath(import.meta.url);
const __dirname=path.dirname(__filename);
const sharedDirectory=path.resolve(__dirname,"..","shared");

export default defineConfig({
 plugins:[react()],
 resolve:{
  dedupe:["react","react-dom"],
  alias:{"@shared":sharedDirectory}
 },
 optimizeDeps:{
  include:["react","react-dom","axios","react-bootstrap"]
 },
 server:{
  port:Number(process.env.PORT)||5185,
  strictPort:true,
  fs:{
   allow:[".."]
  },
  host:true,
  open:false,
  watch:{
   usePolling:true,
   interval:300
  },
  proxy:{
   "/api":{target:"http://localhost:6011",changeOrigin:true,secure:false},
   "/images":{target:"http://localhost:6011",changeOrigin:true,secure:false}

  }
 }
});
