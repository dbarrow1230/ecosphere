// backend/server.js
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import path from "path";
import fs from "fs";
import {fileURLToPath} from "url";
import http from "http";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import multer from "multer";

/* location routes */
import stateRoutes from "./routes/locations/stateRoutes.js";
import countryRoutes from "./routes/locations/countryRoutes.js";
import countyRoutes from "./routes/locations/countyRoutes.js";

/** clients */
import clientRoutes from "./routes/clients/clientsRoutes.js";

/* products */
import productRoutes from "./routes/products/productsRoutes.js";

/** ingredients */
import ingredientsRoutes from "./routes/ingredients/ingredientsRoutes.js";

/** costings */
import costingsRoutes from "./routes/costings/costingsRoutes.js";
import orderRoutes from "./routes/orders/orderRoutes.js";
import eventRoutes from "./routes/events/eventRoutes.js";

/* reference data */
import partsRoutes from "./routes/reference/partsRoutes.js";
import formsRoutes from "./routes/reference/formsRoutes.js";
import statusRoutes from "./routes/reference/statusRoutes.js";
import metricunitsRoutes from "./routes/reference/metricUnitsRoutes.js";
import imperialunitsRoutes from "./routes/reference/imperialUnitsRoutes.js";
import categoryRoutes from "./routes/reference/categoryRoutes.js";
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

// users
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
import departmentPermissionRoutes from "./routes/users/departmentPermissionRoutes.js";
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

/* middleware */
app.use(morgan("dev"));
app.use(express.json({limit:"3mb"}));
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
app.get("/api/health",(req,res)=>{res.json({status:"ok"});});
app.use("/api/app-modules",appModuleRoutes);
app.use("/api/app",appRoutes);


/* location routes */
app.use("/api/states",stateRoutes);
app.use("/api/countries",countryRoutes);
app.use("/api/counties",countyRoutes);

// clients api
app.use("/api/clients",clientRoutes);

//products api
app.use("/api/products",productRoutes);

//ingredients api
app.use("/api/ingredients",ingredientsRoutes);

//costings api
app.use("/api/costings",costingsRoutes);
app.use("/api/orders",orderRoutes);
app.use("/api/events",eventRoutes);

//refernce data api
app.use("/api/reference/parts",partsRoutes);
app.use("/api/reference/forms",formsRoutes);
app.use("/api/reference/statuses",statusRoutes);
app.use("/api/reference/metric-units",metricunitsRoutes);
app.use("/api/reference/imperial-units",imperialunitsRoutes);
app.use("/api/reference/categories",categoryRoutes);
app.use("/api/reference/allergens",allergenRoutes);
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

 startKeyboardShutdown();

 server.listen(PORT,()=>{
  console.log(`Backend running on port ${PORT}`);
 });
};

process.on("SIGINT",()=>shutdown("SIGINT"));
process.on("SIGTERM",()=>shutdown("SIGTERM"));

await startApp();
