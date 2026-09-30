// backend/server.js
import express from "express";
import http from "http";
import mongoose from "mongoose";
import cors from "cors";
import path from "path";
import fs from "fs";
import {fileURLToPath} from "url";
import {spawn,spawnSync} from "child_process";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import multer from "multer";

/* location routes */
import stateRoutes from "./routes/locations/stateRoutes.js";
import countryRoutes from "./routes/locations/countryRoutes.js";
import countyRoutes from "./routes/locations/countyRoutes.js";

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
import vendorRoutes from "./routes/reference/vendorRoutes.js";
import allergenRoutes from "./routes/reference/allergenRoutes.js";

/* planner routes */
import bookRoutes from "./routes/planner/bookRoutes.js";
import genreCatalogRoutes from "./routes/planner/genreCatalogRoutes.js";
import {bookDeadlineRoutes,bookGoalRoutes,bookSessionRoutes} from "./routes/planner/bookTrackingRoutes.js";
import bubbleShapeRoutes from "./routes/planner/bubbleShapeRoutes.js";
import chaptersScenesRoutes from "./routes/planner/chaptersScenesRoutes.js";
import characterDevelopmentRoutes from "./routes/planner/characterDevelopmentRoutes.js";
import characterRoleRoutes from "./routes/planner/characterRoleRoutes.js";
import notesBrainstormExtraToolsRoutes from "./routes/planner/notesBrainstormExtraToolsRoutes.js";
import plotStructureStoryPlanningRoutes from "./routes/planner/plotStructureStoryPlanningRoutes.js";
import projectOverviewDevelopmentRoutes from "./routes/planner/projectOverviewDevelopmentRoutes.js";
import researchInspirationRoutes from "./routes/planner/researchInspirationRoutes.js";
import revisionEditingRoutes from "./routes/planner/revisionEditingRoutes.js";
import worldBuildingSettingRoutes from "./routes/planner/worldBuildingSettingRoutes.js";
import writingProgressProductivityRoutes from "./routes/planner/writingProgressProductivityRoutes.js";

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

/* app */
import appModuleRoutes from "./routes/app/appModuleRoutes.js";
import appRoutes from "./routes/app/appRoutes.js";

/* error middleware */
import {notFound,errorHandler} from "./middleware/errorMiddleware.js";

const app=express();
const server=http.createServer(app);
const PORT=process.env.PORT||3001;

const __filename=fileURLToPath(import.meta.url);
const __dirname=path.dirname(__filename);

let isShuttingDown=false;
let mongoProcess=null;

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
const uploadDirNames=(process.env.UPLOAD_DIRS||"logos,avatars").split(",").map(dir=>dir.trim()).filter(Boolean);

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
app.get("/api/health",(req,res)=>{res.json({status:"ok"});});
app.use("/api/app-modules",appModuleRoutes);
app.use("/api/app",appRoutes);

/* location routes */
app.use("/api/states",stateRoutes);
app.use("/api/countries",countryRoutes);
app.use("/api/counties",countyRoutes);

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
app.use("/api/vendors",vendorRoutes);
app.use("/api/allergens",allergenRoutes);

/* planner routes */
app.use("/api/planner/books",bookRoutes);
app.use("/api/planner/genre-catalog",genreCatalogRoutes);
app.use("/api/planner/book-goals",bookGoalRoutes);
app.use("/api/planner/book-deadlines",bookDeadlineRoutes);
app.use("/api/planner/book-sessions",bookSessionRoutes);
app.use("/api/planner/bubble-shapes",bubbleShapeRoutes);
app.use("/api/planner/chapters-scenes",chaptersScenesRoutes);
app.use("/api/planner/character-development",characterDevelopmentRoutes);
app.use("/api/planner/character-roles",characterRoleRoutes);
app.use("/api/planner/notes-brainstorm-extra-tools",notesBrainstormExtraToolsRoutes);
app.use("/api/planner/plot-structure-story-planning",plotStructureStoryPlanningRoutes);
app.use("/api/planner/project-overview-development",projectOverviewDevelopmentRoutes);
app.use("/api/planner/research-inspiration",researchInspirationRoutes);
app.use("/api/planner/revision-editing",revisionEditingRoutes);
app.use("/api/planner/world-building-setting",worldBuildingSettingRoutes);
app.use("/api/planner/writing-progress-productivity",writingProgressProductivityRoutes);

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
app.use("/api/users",userRoutes);

/* upload */
app.post("/api/upload/:dir",upload.single("file"),(req,res)=>{
 if(!req.file)
  return res.status(400).json({success:false,message:"No file uploaded"});

 const target=getUploadFolder(req);

 if(!target)
  return res.status(400).json({success:false,message:"Invalid upload directory"});

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
app.use(notFound);
app.use((err,req,res,next)=>{
 if(err instanceof multer.MulterError){
  if(err.code==="LIMIT_FILE_SIZE"){
   return res.status(400).json({success:false,message:"File size must be 25MB or less"});
  }
 }

 return errorHandler(err,req,res,next);
});

/* powershell scripts */
const runPowerShellScriptSync=(scriptPath,label)=>{
 if(!scriptPath)return;

 console.log(`Running ${label} PowerShell script: ${scriptPath}`);

 const result=spawnSync(
  "powershell.exe",
  ["-NoProfile","-NonInteractive","-ExecutionPolicy","Bypass","-File",scriptPath],
  {encoding:"utf8",stdio:["ignore","pipe","pipe"],windowsHide:true}
 );

 const stdout=String(result.stdout||"").split(/\r?\n/).map(line=>line.trim()).filter(Boolean);
 const stderr=String(result.stderr||"").split(/\r?\n/).map(line=>line.trim()).filter(Boolean);

 for(const line of stdout){
  console.log(`[${label}] ${line}`);
 }

 for(const line of stderr){
  console.error(`[${label}] ${line}`);
 }

 if(result.error){
  console.error(`${label} PowerShell script failed`,result.error);
  return;
 }

 console.log(`${label} PowerShell script exited with code ${result.status}`);

 if(result.status!==0){
  console.error(`${label} PowerShell script failed with exit code ${result.status}`);
 }
};

const startMongoScript=()=>{
 if(!process.env.POWERSHELL_SCRIPT)return Promise.resolve();

 return new Promise((resolve,reject)=>{
  console.log(`Starting PowerShell script: ${process.env.POWERSHELL_SCRIPT}`);

  mongoProcess=spawn(
   "powershell.exe",
   ["-NoProfile","-NonInteractive","-ExecutionPolicy","Bypass","-File",process.env.POWERSHELL_SCRIPT],
   {stdio:["ignore","pipe","pipe"],windowsHide:true}
  );

  mongoProcess.stdout?.on("data",data=>{
   const lines=data.toString().split(/\r?\n/).map(line=>line.trim()).filter(Boolean);
   for(const line of lines){
    console.log(`[powershell] ${line}`);
   }
  });

  mongoProcess.stderr?.on("data",data=>{
   const lines=data.toString().split(/\r?\n/).map(line=>line.trim()).filter(Boolean);
   for(const line of lines){
    console.error(`[powershell] ${line}`);
   }
  });

  mongoProcess.on("error",err=>{
   reject(err);
  });

  mongoProcess.on("close",code=>{
   console.log(`PowerShell script exited with code ${code}`);
   if(code===0)return resolve();
   reject(new Error(`PowerShell script failed with exit code ${code}`));
  });
 });
};

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
 if(isShuttingDown){
  return;
 }

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

  if(mongoose.connection.readyState===1){
   await mongoose.connection.close();
  }

  runPowerShellScriptSync(process.env.STOP_POWERSHELL_SCRIPT,"stop-mongo");

  if(mongoProcess&&!mongoProcess.killed){
   mongoProcess.kill();
  }

  process.exit(0);
 }catch(err){
  console.error(err);
  runPowerShellScriptSync(process.env.STOP_POWERSHELL_SCRIPT,"stop-mongo");
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

 await startMongoScript();
 await waitForMongo(process.env.MONGO_URI);

 startKeyboardShutdown();

 server.listen(PORT,()=>{
  console.log(`Backend running on port ${PORT}`);
 });
};

process.on("SIGINT",()=>shutdown("SIGINT"));
process.on("SIGTERM",()=>shutdown("SIGTERM"));

await startApp();
