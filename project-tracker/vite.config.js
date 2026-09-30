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
   "/api":{target:"http://127.0.0.1:6019",changeOrigin:true,secure:false},
   "/images":{target:"http://127.0.0.1:6019",changeOrigin:true,secure:false},
   "/avatars":{target:"http://127.0.0.1:6019",changeOrigin:true,secure:false},
   "/logos":{target:"http://127.0.0.1:6019",changeOrigin:true,secure:false},
   "/attachments":{target:"http://127.0.0.1:6019",changeOrigin:true,secure:false}

  }
 }
});
