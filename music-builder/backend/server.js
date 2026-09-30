import standaloneMenuRoutes from "./routes/standaloneMenuRoutes.js";
import standaloneInventoryRoutes from "./routes/standaloneInventoryRoutes.js";
import contactRoutes from "./routes/contactRoutes.js";
// backend/server.js
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import path from "path";
import fs from "fs";
import http from "http";
import {fileURLToPath,pathToFileURL} from "url";
import {spawn} from "child_process";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import multer from "multer";

/* reference data routes */
import businessRoutes from "./routes/reference/businessRoutes.js";
import businessTypeRoutes from "./routes/reference/businessTypeRoutes.js";
import appKeyRoutes from "./routes/reference/appKeyRoutes.js";
import footerRoutes from "./routes/reference/footerRoutes.js";
import seasonRoutes from "./routes/reference/seasonRoutes.js";
import taglineRoutes from "./routes/reference/taglineRoutes.js";
import occasionRoutes from "./routes/reference/occasionRoutes.js";
import holidayRoutes from "./routes/reference/holidayRoutes.js";
import receiptTemplateRoutes from "./routes/reference/receiptTemplateRoutes.js";
import receiptHeaderRoutes from "./routes/reference/receiptHeaderRoutes.js";
import receiptSubHeaderRoutes from "./routes/reference/receiptSubHeaderRoutes.js";
import receiptFooterRoutes from "./routes/reference/receiptFooterRoutes.js";
import imperialUnitRoutes from "./routes/reference/ImperialUnitRoutes.js";
import metricUnitRoutes from "./routes/reference/MetricUnitRoutes.js";
import locationTypeRoutes from "./routes/reference/LocationTypeRoutes.js";
import locationRoutes from "./routes/reference/LocationRoutes.js";
import taxRateRoutes from "./routes/reference/taxRateRoutes.js";
import allergenRoutes from "./routes/reference/allergenRoutes.js";
import vendorRoutes from "./routes/reference/vendorRoutes.js";

/* locations */
import countryRoutes from "./routes/locations/countryRoutes.js";
import stateRoutes from "./routes/locations/stateRoutes.js";
import countyRoutes from "./routes/locations/countyRoutes.js";

/* users */
import userDetailsRoutes from "./routes/users/userDetailsRoutes.js";
import userRoutes from "./routes/users/userRoutes.js";
import userRolesRoutes from "./routes/users/userRolesRoutes.js";
import userRoleAssignmentRoutes from "./routes/users/userRoleAssignmentRoutes.js";
import rolePermissionRoutes from "./routes/users/rolePermissionRoutes.js";
import userPermissionOverrideRoutes from "./routes/users/userPermissionOverrideRoutes.js";
import effectivePermissionRoutes from "./routes/users/effectivePermissionRoutes.js";
import permissionRoutes from "./routes/users/permissionRoutes.js";
import permissionModuleRoutes from "./routes/users/permissionModuleRoutes.js";
import businessDepartmentRoutes from "./routes/users/businessDepartmentRoutes.js";
import userDepartmentAssignmentRoutes from "./routes/users/userDepartmentAssignmentRoutes.js";
import departmentPermissionRoutes from "./routes/users/departmentPermissionRoutes.js";

/* app */
import appModuleRoutes from "./routes/app/appModuleRoutes.js";
import appRoutes from "./routes/app/appRoutes.js";

/* music */
import musicProjectRoutes from "./routes/musicProjectRoutes.js";
import chordIdeaRoutes from "./routes/chordIdeaRoutes.js";
import chordProgressionRoutes from "./routes/chordProgressionRoutes.js";
import lyricIdeaRoutes from "./routes/lyricIdeaRoutes.js";
import arrangementIdeaRoutes from "./routes/arrangementIdeaRoutes.js";
import musicNoteRoutes from "./routes/musicNoteRoutes.js";
import musicInstrumentRoutes from "./routes/musicInstrumentRoutes.js";
import chordInversionRoutes from "./routes/chordInversionRoutes.js";

/* error middleware */
import {notFound,errorHandler} from "./middleware/errorMiddleware.js";
import {seedMusicReferences} from "./services/musicReferenceService.js";
import {seedAcceptedSongMaterial} from "./services/acceptedSongSeedService.js";

const app=express();
const server=http.createServer(app);
const PORT=process.env.PORT||6037;

const __filename=fileURLToPath(import.meta.url);
const __dirname=path.dirname(__filename);

let isShuttingDown=false;
const activeFrontendServers=new Map();
const activeBackendProcesses=new Map();
const appIdPattern=/^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const runtimeConfigPath=path.resolve(__dirname,"..","..","app-runtime-config.json");
const runtimeConfig=JSON.parse(fs.readFileSync(runtimeConfigPath,"utf8"));

const getApplicationDirectory=appId=>{
 if(!appIdPattern.test(appId))return null;

 const ecosphereRoot=path.resolve(__dirname,"..");
 const localDirectory=path.join(ecosphereRoot,appId);

 if(fs.existsSync(path.join(localDirectory,"package.json")))return localDirectory;

 return null;
};

const parsePlainEnvironmentFile=filePath=>{
 const values={};

 for(const rawLine of fs.readFileSync(filePath,"utf8").split(/\r?\n/)){
  const line=rawLine.trim();
  if(!line||line.startsWith("#"))continue;

  const separatorIndex=line.indexOf("=");
  if(separatorIndex<1)continue;

  const key=line.slice(0,separatorIndex).trim();
  let value=line.slice(separatorIndex+1).trim();
  if((value.startsWith('"')&&value.endsWith('"'))||(value.startsWith("'")&&value.endsWith("'")))value=value.slice(1,-1);
  values[key]=value;
 }

 return values;
};

const getEnvironmentKeys=filePath=>{
 const keys=[];

 for(const rawLine of fs.readFileSync(filePath,"utf8").split(/\r?\n/)){
  const line=rawLine.trim();
  if(!line||line.startsWith("#"))continue;

  const separatorIndex=line.indexOf("=");
  if(separatorIndex<1)continue;

  const key=line.slice(0,separatorIndex).trim();
  if(/^[A-Za-z_][A-Za-z0-9_]*$/.test(key))keys.push(key);
 }

 return keys;
};

const waitForApplicationBackend=async(port,childProcess,retries=60)=>{
 const healthUrl=`http://${runtimeConfig.host}:${port}/api/health`;

 for(let attempt=0;attempt<retries;attempt+=1){
  if(childProcess.exitCode!==null)throw new Error(`Application backend exited with code ${childProcess.exitCode}.`);

  try{
   const response=await fetch(healthUrl,{signal:AbortSignal.timeout(750)});
   if(response.ok)return;
  }catch{
   // The backend is still connecting to its configured database.
  }

  await new Promise(resolve=>setTimeout(resolve,500));
 }

 throw new Error(`Application backend did not become ready on port ${port}.`);
};

const activateApplicationBackend=async appId=>{
 const backendPort=runtimeConfig.backends?.[appId];
 if(!backendPort)throw new Error(`No backend port is configured for "${appId}".`);

 const runningProcess=activeBackendProcesses.get(appId);
 if(runningProcess&&runningProcess.exitCode===null)return backendPort;

 const applicationDirectory=getApplicationDirectory(appId);
 if(!applicationDirectory)throw new Error(`Application directory not found for "${appId}".`);

 const serverPath=path.join(applicationDirectory,"backend","server.js");
 const environmentPath=path.join(applicationDirectory,"backend",".env");
 if(!fs.existsSync(serverPath))throw new Error(`Backend server is missing for "${appId}".`);
 if(!fs.existsSync(environmentPath))throw new Error(`Backend environment is missing for "${appId}".`);

 const dotenvxCliPath=path.resolve(__dirname,"..","node_modules","@dotenvx","dotenvx","src","cli","dotenvx.js");
 if(!fs.existsSync(dotenvxCliPath))throw new Error("The shared Dotenvx runtime is not installed.");
 const childEnvironment={...process.env};

 for(const key of getEnvironmentKeys(environmentPath))delete childEnvironment[key];
 for(const key of Object.keys(childEnvironment)){
  if(key==="DOTENV_PUBLIC_KEY"||key.startsWith("DOTENV_PRIVATE_KEY"))delete childEnvironment[key];
 }

 if(!process.env.JWT_SECRET)throw new Error("The Eco Sphere JWT_SECRET is not configured.");

 // Child applications keep their own database and service environment, but all
 // applications launched from Eco Sphere must validate the same signed-in user.
 childEnvironment.JWT_SECRET=process.env.JWT_SECRET;
 childEnvironment.ECOSPHERE_MONGO_URI=process.env.MONGO_URI;
 childEnvironment.PORT=String(backendPort);

 const childProcess=spawn(process.execPath,[
  dotenvxCliPath,
  "run",
  "--env-file",
  environmentPath,
  "--",
  process.execPath,
  serverPath
 ],{
  cwd:applicationDirectory,
  env:childEnvironment,
  stdio:["ignore","pipe","pipe"],
  windowsHide:true
 });

 activeBackendProcesses.set(appId,childProcess);

 childProcess.stdout?.on("data",data=>{
  for(const line of String(data).split(/\r?\n/).filter(Boolean))console.log(`[${appId}:backend] ${line}`);
 });
 childProcess.stderr?.on("data",data=>{
  for(const line of String(data).split(/\r?\n/).filter(Boolean))console.error(`[${appId}:backend] ${line}`);
 });
 childProcess.on("exit",()=>{
  if(activeBackendProcesses.get(appId)===childProcess)activeBackendProcesses.delete(appId);
 });

 try{
  await waitForApplicationBackend(backendPort,childProcess);
  return backendPort;
 }catch(error){
  if(childProcess.exitCode===null)childProcess.kill();
  activeBackendProcesses.delete(appId);
  throw error;
 }
};

const activateApplicationFrontend=async appId=>{
 const frontendPort=runtimeConfig.applications?.[appId];
 if(!frontendPort)throw new Error(`No frontend port is configured for "${appId}".`);
 const backendPort=runtimeConfig.backends?.[appId];
 if(!backendPort)throw new Error(`No backend port is configured for "${appId}".`);

 if(activeFrontendServers.has(appId))return `http://${runtimeConfig.host}:${frontendPort}`;

 const applicationDirectory=getApplicationDirectory(appId);
 if(!applicationDirectory)throw new Error(`Application directory not found for "${appId}".`);
 const frontendEnvironmentPath=path.join(applicationDirectory,".env");
 const frontendEnvironment=fs.existsSync(frontendEnvironmentPath)
  ?parsePlainEnvironmentFile(frontendEnvironmentPath)
  :{};
 const backendEnvironmentPath=path.join(applicationDirectory,"backend",".env");
 const backendEnvironment=fs.existsSync(backendEnvironmentPath)
  ?parsePlainEnvironmentFile(backendEnvironmentPath)
  :{};
 const backendUrl=`http://${runtimeConfig.host}:${backendPort}`;
 const uploadDirectories=String(frontendEnvironment.VITE_UPLOAD_DIRS||backendEnvironment.UPLOAD_DIRS||"")
  .split(",")
  .map(directory=>directory.trim())
  .filter(Boolean);
 const runtimeProxy={
  "/api":{target:backendUrl,changeOrigin:true,secure:false},
  "/socket.io":{target:backendUrl,changeOrigin:true,secure:false,ws:true}
 };

 for(const directory of uploadDirectories){
  runtimeProxy[`/${directory}`]={target:backendUrl,changeOrigin:true,secure:false};
 }

 const shellViteEntry=path.resolve(__dirname,"..","node_modules","vite","dist","node","index.js");

 if(!fs.existsSync(shellViteEntry)){
  throw new Error("The Eco Sphere shell Vite runtime is not installed.");
 }

 // Eco Sphere owns one explicit development runtime. Application source and
 // configuration remain inside the selected subdirectory.
 const {createServer}=await import(pathToFileURL(shellViteEntry).href);
 const sharedDirectory=path.resolve(__dirname,"..","shared");
 const frontendServer=await createServer({
  root:applicationDirectory,
  resolve:{
   alias:{"@shared":sharedDirectory},
   dedupe:["react","react-dom"]
  },
  server:{
   host:runtimeConfig.host,
   port:frontendPort,
   strictPort:true,
   open:false,
   fs:{allow:[path.resolve(__dirname,".."),sharedDirectory]},
   proxy:runtimeProxy
  }
 });

 await frontendServer.listen();
 activeFrontendServers.set(appId,frontendServer);

 return `http://${runtimeConfig.host}:${frontendPort}`;
};

/* middleware */
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({extended:true}));

const corsOrigins=(process.env.CORS_ORIGIN||"").split(",").map(origin=>origin.trim()).filter(Boolean);
const corsConfig={origin:corsOrigins.length?corsOrigins:true,credentials:true};

app.use(cors(corsConfig));
app.use(cookieParser());

/* uploads */
const uploadRoot=path.join(__dirname,process.env.UPLOAD_ROOT||"public");
const uploadDirNames=(process.env.UPLOAD_DIRS||"").split(",").map(dir=>dir.trim()).filter(Boolean);

const uploadDirs=uploadDirNames.reduce((acc,dir)=>{
 const dirPath=path.join(uploadRoot,dir);

 if(!fs.existsSync(dirPath))fs.mkdirSync(dirPath,{recursive:true});

 app.use(`/${dir}`,express.static(dirPath));
 acc[dir]=dirPath;

 return acc;
},{});

const sanitizePathPart=value=>{
 return String(value||"")
  .trim()
  .replace(/[<>:"/\\|?*\x00-\x1F]/g,"")
  .replace(/\s+/g," ")
  .trim();
};

const ensureDir=dirPath=>{
 if(!fs.existsSync(dirPath))fs.mkdirSync(dirPath,{recursive:true});
};

const getUploadFolder=req=>{
 const dir=sanitizePathPart(req.params.dir||req.body.dir||req.query.dir||"");

 if(!dir||!uploadDirs[dir])return null;

 const folderName=sanitizePathPart(req.body.folderName||req.query.folderName||"");
 const subfolder=sanitizePathPart(req.body.subfolder||req.query.subfolder||"");

 let dirPath=uploadDirs[dir];
 let relativeDir=dir;

 if(folderName){
  dirPath=path.join(dirPath,folderName);
  relativeDir=`${relativeDir}/${folderName}`;
  ensureDir(dirPath);
 }

 if(subfolder){
  dirPath=path.join(dirPath,subfolder);
  relativeDir=`${relativeDir}/${subfolder}`;
  ensureDir(dirPath);
 }

 return{
  dir,
  dirPath,
  relativeDir
 };
};

const storage=multer.diskStorage({
 destination:(req,file,cb)=>{
  try{
   const target=getUploadFolder(req);

   if(!target)return cb(new Error("Invalid upload directory"));

   ensureDir(target.dirPath);
   cb(null,target.dirPath);
  }catch(error){
   cb(error);
  }
 },
 filename:(req,file,cb)=>{
  const timestamp=Date.now();
  const originalName=String(file.originalname||"file").replace(/\\/g,"/").split("/").pop();
  const safeName=originalName.replace(/[<>:"/\\|?*\x00-\x1F]/g,"_");

  if(String(req.params.dir||req.body.dir||req.query.dir||"").trim()==="logos"){
   cb(null,safeName);
   return;
  }

  cb(null,`${timestamp}-${safeName}`);
 }
});

const upload=multer({
 storage,
 limits:{fileSize:parseInt(process.env.UPLOAD_MAX_SIZE,10)||26214400}
});

/* API's */
app.get("/api/health",(req,res)=>{
 res.json({status:"ok"});
});

app.post("/api/app-runtime/activate/:appId",async(req,res)=>{
 try{
  if(process.env.NODE_ENV==="production"){
   return res.status(403).json({message:"Local application activation is available only in development."});
  }

  const appId=String(req.params.appId||"").trim().toLowerCase();
  const backendPort=await activateApplicationBackend(appId);
  const url=await activateApplicationFrontend(appId);
  const port=runtimeConfig.applications[appId];

  return res.json({appId,url,port,backendPort,status:"ready"});
 }catch(error){
  const portInUse=error?.code==="EADDRINUSE"||String(error?.message||"").includes("already in use");

  return res.status(portInUse?409:500).json({
   message:portInUse
    ?"The configured application port is already in use by another process."
    :"Unable to start the selected application.",
   error:error.message
  });
 }
});

app.use("/api/app-modules",appModuleRoutes);
app.use("/api/app",appRoutes);

/* music */
app.use("/api/music-projects",musicProjectRoutes);
app.use("/api/chord-ideas",chordIdeaRoutes);
app.use("/api/chord-progressions",chordProgressionRoutes);
app.use("/api/lyric-ideas",lyricIdeaRoutes);
app.use("/api/arrangement-ideas",arrangementIdeaRoutes);
app.use("/api/music-notes",musicNoteRoutes);
app.use("/api/music-instruments",musicInstrumentRoutes);
app.use("/api/chord-inversions",chordInversionRoutes);

/* reference data routes */
app.use("/api/businesses",businessRoutes);
app.use("/api/business",businessRoutes);
app.use("/api/business-types",businessTypeRoutes);
app.use("/api/app-keys",appKeyRoutes);
app.use("/api/footers",footerRoutes);
app.use("/api/seasons",seasonRoutes);
app.use("/api/taglines",taglineRoutes);
app.use("/api/occasions",occasionRoutes);
app.use("/api/holidays",holidayRoutes);
app.use("/api/receipt-templates",receiptTemplateRoutes);
app.use("/api/receipt-headers",receiptHeaderRoutes);
app.use("/api/receipt-sub-headers",receiptSubHeaderRoutes);
app.use("/api/receipt-footers",receiptFooterRoutes);
app.use("/api/imperial-units",imperialUnitRoutes);
app.use("/api/metric-units",metricUnitRoutes);
app.use("/api/location-types",locationTypeRoutes);
app.use("/api/locations",locationRoutes);
app.use("/api/tax-rates",taxRateRoutes);
app.use("/api/allergens",allergenRoutes);
app.use("/api/vendors",vendorRoutes);

/* locations */
app.use("/api/countries",countryRoutes);
app.use("/api/states",stateRoutes);
app.use("/api/counties",countyRoutes);

/* users */
app.use("/api/users/details",userDetailsRoutes);
app.use("/api/users/roles",userRolesRoutes);
app.use("/api/users/role-assignments",userRoleAssignmentRoutes);
app.use("/api/users/role-permissions",rolePermissionRoutes);
app.use("/api/users/user-permission-overrides",userPermissionOverrideRoutes);
app.use("/api/users/effective-permissions",effectivePermissionRoutes);
app.use("/api/users/permissions",permissionRoutes);
app.use("/api/users/permission-modules",permissionModuleRoutes);
app.use("/api/users/business-departments",businessDepartmentRoutes);
app.use("/api/users/department-assignments",userDepartmentAssignmentRoutes);
app.use("/api/users/department-permissions",departmentPermissionRoutes);
app.use("/api/users",userRoutes);

/* upload */
app.post("/api/upload/:dir",upload.single("file"),(req,res)=>{
 if(!req.file){
  return res.status(400).json({
   success:false,
   message:"No file uploaded"
  });
 }

 const target=getUploadFolder(req);

 if(!target){
  return res.status(400).json({
   success:false,
   message:"Invalid upload directory"
  });
 }

 res.json({
  success:true,
  filename:req.file.filename,
  originalName:req.file.originalname,
  folder:target.dir,
  relativePath:`${target.relativeDir}/${req.file.filename}`,
  url:`/${target.relativeDir}/${req.file.filename}`
 });
});

/* error middleware */
app.use("/api/contact",contactRoutes);

app.use("/api/inventory",standaloneInventoryRoutes);

app.use("/api/menus",standaloneMenuRoutes);

app.use(notFound);
app.use((err,req,res,next)=>{
 if(err instanceof multer.MulterError){
  if(err.code==="LIMIT_FILE_SIZE"){
   return res.status(400).json({
    success:false,
    message:"File size must be 25MB or less"
   });
  }
 }

 return errorHandler(err,req,res,next);
});



const waitForMongo=async(uri,retries=30,delay=2000)=>{
 for(let i=0;i<retries;i++){
  try{
   await mongoose.connect(uri);
   console.log("MongoDB connected");
   return;
  }catch(err){
   console.log(`Waiting for MongoDB... attempt ${i+1}/${retries}`);

   if(i===retries-1)throw err;

   await new Promise(resolve=>setTimeout(resolve,delay));
  }
 }
};

const closeServer=()=>{
 return new Promise(resolve=>{
  if(!server.listening)return resolve();

  server.close(()=>resolve());
 });
};

const shutdown=async(signal="SIGTERM")=>{
 if(isShuttingDown)return;

 isShuttingDown=true;

 try{
  console.log(`Received ${signal}. Shutting down...`);

  if(process.stdin.isTTY){
   process.stdin.setRawMode(false);
   process.stdin.pause();
  }

  process.removeAllListeners("SIGINT");
  process.removeAllListeners("SIGTERM");

  process.on("SIGINT",()=>{});
  process.on("SIGTERM",()=>{});

  await closeServer();

  if(activeFrontendServers.size){
   await Promise.all([...activeFrontendServers.values()].map(frontendServer=>frontendServer.close()));
   activeFrontendServers.clear();
  }

  if(activeBackendProcesses.size){
   for(const childProcess of activeBackendProcesses.values()){
    if(childProcess.exitCode===null)childProcess.kill("SIGTERM");
   }
   activeBackendProcesses.clear();
  }

  if(mongoose.connection.readyState===1){
   await mongoose.connection.close();
  }



  process.exit(0);
 }catch(err){
  console.error(err);
  process.exit(1);
 }
};

const startKeyboardShutdown=()=>{
 if(!process.stdin.isTTY)return;

 process.stdin.setRawMode(true);
 process.stdin.resume();
 process.stdin.setEncoding("utf8");

 process.stdin.on("data",key=>{
  if(key==="q"||key==="Q"){
   shutdown("manual");
  }

  if(key==="\u0003"){
   shutdown("SIGINT");
  }
 });
};

const startApp=async()=>{
 if(!process.env.MONGO_URI)throw new Error("MONGO_URI is not defined");

 await waitForMongo(process.env.MONGO_URI);
 await seedMusicReferences();
 const songSeedResult=await seedAcceptedSongMaterial(process.env.MUSIC_SEED_USERNAME||"dbarrow1230");
 console.log("Accepted song seed:",songSeedResult);

 startKeyboardShutdown();

 server.listen(PORT,()=>{
  console.log(`Backend running on port ${PORT}`);
 });
};

process.on("SIGINT",()=>shutdown("SIGINT"));
process.on("SIGTERM",()=>shutdown("SIGTERM"));

await startApp();
