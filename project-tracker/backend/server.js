// backend/server.js
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import path from "path";
import fs from "fs";
import {fileURLToPath} from "url";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import multer from "multer";
import businessInfoConnection from "./db/businessInfoConnection.js";

/* routes */
import stateRoutes from "./routes/locations/stateRoutes.js";
import countryRoutes from "./routes/locations/countryRoutes.js";
import countyRoutes from "./routes/locations/countyRoutes.js";

// reference
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
import backupLogRoutes from "./routes/backupLogRoutes.js";
import backupScheduleRoutes from "./routes/backupScheduleRoutes.js";

// users
import permissionRoutes from "./routes/users/permissionRoutes.js";
import userDetailsRoutes from "./routes/users/userDetailsRoutes.js";
import userRoutes from "./routes/users/userRoutes.js";
import userRolesRoutes from "./routes/users/userRolesRoutes.js";
import userRoleAssignmentRoutes from "./routes/users/userRoleAssignmentRoutes.js";
import rolePermissionRoutes from "./routes/users/rolePermissionRoutes.js";
import departmentPermissionRoutes from "./routes/users/departmentPermissionRoutes.js";
import userPermissionOverrideRoutes from "./routes/users/userPermissionOverrideRoutes.js";
import effectivePermissionRoutes from "./routes/users/effectivePermissionRoutes.js";
import permissionModuleRoutes from "./routes/users/permissionModuleRoutes.js";
import businessDepartmentRoutes from "./routes/users/businessDepartmentRoutes.js";
import userDepartmentAssignmentRoutes from "./routes/users/userDepartmentAssignmentRoutes.js";
import projectRoutes from "./routes/projectRoutes.js";
import taskRoutes from "./routes/taskRoutes.js";

// app
import appModuleRoutes from "./routes/app/appModuleRoutes.js";
import appRoutes from "./routes/app/appRoutes.js";

/* error middleware */
import {notFound,errorHandler} from "./middleware/errorMiddleware.js";

const app=express();
const PORT=process.env.PORT||6019;

const __filename=fileURLToPath(import.meta.url);
const __dirname=path.dirname(__filename);

/* middleware */
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(cors());
app.use(cookieParser());

const uploadRoot=path.join(__dirname,process.env.UPLOAD_ROOT||"public");
const uploadDirNames=(process.env.UPLOAD_DIRS||"attachments,avatars,images,logos").split(",").map(dir=>dir.trim()).filter(Boolean);
const uploadMaxSize=parseInt(process.env.UPLOAD_MAX_SIZE,10)||26214400;
const uploadDirs=uploadDirNames.reduce((directories,dir)=>{
 const dirPath=path.join(uploadRoot,dir);
 if(!fs.existsSync(dirPath))fs.mkdirSync(dirPath,{recursive:true});
 app.use(`/${dir}`,express.static(dirPath));
 directories[dir]=dirPath;
 return directories;
},{});

const sanitizePathPart=value=>String(value||"").trim().replace(/[<>:"/\\|?*\x00-\x1F]/g,"").replace(/\s+/g," ").trim();
const ensureDir=dirPath=>{if(!fs.existsSync(dirPath))fs.mkdirSync(dirPath,{recursive:true});};
const getUploadFolder=req=>{
 const dir=sanitizePathPart(req.params.dir||req.body?.dir||req.query.dir||"");
 if(!dir||!uploadDirs[dir])return null;
 const folderName=sanitizePathPart(req.body?.folderName||req.query.folderName||"");
 const subfolder=sanitizePathPart(req.body?.subfolder||req.query.subfolder||"");
 let dirPath=uploadDirs[dir];
 let relativeDir=dir;
 if(folderName){dirPath=path.join(dirPath,folderName);relativeDir=`${relativeDir}/${folderName}`;ensureDir(dirPath);}
 if(subfolder){dirPath=path.join(dirPath,subfolder);relativeDir=`${relativeDir}/${subfolder}`;ensureDir(dirPath);}
 return{dir,dirPath,relativeDir};
};

const sanitizeFileName=value=>{
 const originalName=String(value||"file").replace(/\\/g,"/").split("/").pop();
 return originalName.replace(/[<>:"/\\|?*\x00-\x1F]/g,"_").trim()||"file";
};

const storage=multer.diskStorage({
 destination:(req,file,cb)=>{
  const target=getUploadFolder(req);
  if(!target)return cb(new Error("Invalid upload directory"));
  ensureDir(target.dirPath);
  cb(null,target.dirPath);
 },
 filename:(req,file,cb)=>{
  const safeName=sanitizeFileName(file.originalname);
  if(String(req.params.dir||"").trim()==="logos")return cb(null,safeName);
  cb(null,`${Date.now()}-${safeName}`);
 }
});

const upload=multer({storage,limits:{fileSize:uploadMaxSize}});

/* API's */
app.get("/api/health",(req,res)=>{res.json({status:"ok"});});

app.use("/api/app",appRoutes);
app.use("/api/app-modules",appModuleRoutes);

app.use("/api/states",stateRoutes);
app.use("/api/countries",countryRoutes);
app.use("/api/counties",countyRoutes);

// reference api
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
app.use("/api/backup-logs",backupLogRoutes);
app.use("/api/backup-schedules",backupScheduleRoutes);

// user api
app.use("/api/users/details",userDetailsRoutes);
app.use("/api/users/roles",userRolesRoutes);
app.use("/api/users/role-assignments",userRoleAssignmentRoutes);
app.use("/api/users/role-permissions",rolePermissionRoutes);
app.use("/api/users/department-permissions",departmentPermissionRoutes);
app.use("/api/users/user-permission-overrides",userPermissionOverrideRoutes);
app.use("/api/users/effective-permissions",effectivePermissionRoutes);
app.use("/api/users/permissions",permissionRoutes);
app.use("/api/users/permission-modules",permissionModuleRoutes);
app.use("/api/users/business-departments",businessDepartmentRoutes);
app.use("/api/users/department-assignments",userDepartmentAssignmentRoutes);
app.use("/api/users",userRoutes);
app.use("/api/projects",projectRoutes);
app.use("/api/tasks",taskRoutes);

// upload example
app.post("/api/upload/:dir",upload.single("file"),(req,res)=>{
 if(!req.file)
  return res.status(400).json({success:false,message:"No file uploaded"});

 const target=getUploadFolder(req);
 if(!target)return res.status(400).json({success:false,message:"Invalid upload directory"});

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
  if(err.code==="LIMIT_FILE_SIZE")return res.status(400).json({success:false,message:`File size must be ${Math.round(uploadMaxSize/(1024*1024))}MB or less`});
  return res.status(400).json({success:false,message:err.message});
 }
 if(err?.message==="Invalid upload directory")return res.status(400).json({success:false,message:err.message});
 return errorHandler(err,req,res,next);
});

/* powershell script */


// helper: waitForMongo
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

/* startup */
let server=null;

const startApp=async()=>{
 if(!process.env.MONGO_URI)throw new Error("MONGO_URI is not defined");

 await waitForMongo(process.env.MONGO_URI);

 server=app.listen(PORT,()=>{console.log(`Backend running on port ${PORT}`);});
};

await startApp();

/* graceful shutdown */
const shutdown=async()=>{
 try
 {
  if(server)await new Promise(resolve=>server.close(resolve));
  if(mongoose.connection.readyState===1)await mongoose.connection.close();
  if(businessInfoConnection.readyState===1)await businessInfoConnection.close();
  process.exit(0);
 }
 catch(err)
 {
  console.error(err);
  process.exit(1);
 }
};

process.on("SIGINT",shutdown);
process.on("SIGTERM",shutdown);
