import path from "node:path";
import {createRequire} from "node:module";
import {fileURLToPath,pathToFileURL} from "node:url";
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"..");
const app=process.argv[2];
if(!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(app||""))throw new Error("Supply a configured application name.");
const directory=path.join(root,app);
const require=createRequire(path.join(directory,"package.json"));
const dotenvx=require("@dotenvx/dotenvx");
const env=dotenvx.config({path:path.join(directory,"backend/.env"),quiet:true});
if(env.error){console.error(JSON.stringify({app,status:"environment-failed",code:env.error.code}));process.exit(1);}
const mongoose=require("mongoose");
const disconnected=mongoose.createConnection.bind(mongoose);
mongoose.createConnection=()=>disconnected();
mongoose.connect=async()=>{
 console.log(JSON.stringify({app,status:"module-initialization-passed",databaseConnections:0,databaseWrites:0}));
 process.exit(0);
};
// Avoid upload directory creation during this isolated initialization probe.
process.env.UPLOAD_DIRS="";
process.chdir(directory);
try{await import(pathToFileURL(path.join(directory,"backend/server.js")).href);}
catch(error){
 let message=error.stack||String(error);
 for(const [key,value]of Object.entries(process.env))if(/SECRET|KEY|PASSWORD|MONGO.*URI/.test(key)&&value)message=message.split(value).join("[redacted]");
 console.error(message);process.exitCode=1;
}
