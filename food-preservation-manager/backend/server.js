// backend/server.js
import express from "express";
import http from "http";
import mongoose from "mongoose";
import cors from "cors";
import path from "path";
import fs from "fs";
import {fileURLToPath} from "url";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import multer from "multer";
import {Server} from "socket.io";
//location
import stateRoutes from "./routes/location/stateRoutes.js";
import countryRoutes from "./routes/location/countryRoutes.js";
import countyRoutes from "./routes/location/countyRoutes.js";
//finance
import electricityAccountRoutes from "./routes/finance/electricityAccountRoutes.js";
import electricityRateRoutes from "./routes/finance/electricityRateRoutes.js";
import fuelAccountRoutes from "./routes/finance/fuelAccountRoutes.js";
import fuelRateRoutes from "./routes/finance/fuelRateRoutes.js";
import fuelSourceRoutes from "./routes/finance/fuelSourceRoutes.js";
//dehydration
import dehydrationSetupRoutes from "./routes/preservation/dehydrationSetupRoutes.js";
import dehydrationProcessRoutes from "./routes/preservation/dehydrationProcessRoutes.js";
import dehydratorRoutes from "./routes/preservation/dehydratorRoutes.js";
//products
import productRoutes from "./routes/product/productRoutes.js";
import productBatchRoutes from "./routes/product/productBatchRoutes.js";
//menu
import menuRoutes from "./routes/menu/menuRoutes.js";
import menuItemRoutes from "./routes/menu/menuItemRoutes.js";
//orders
import customerRoutes from "./routes/orders/customerRoutes.js";
import eventRoutes from "./routes/orders/eventRoutes.js";
import orderRoutes from "./routes/orders/orderRoutes.js";
//inventory
import inventoryRoutes from "./routes/inventory/inventoryRoutes.js";
import storageLocationRoutes from "./routes/inventory/storageLocationRoutes.js";
//supplier
import supplierRoutes from "./routes/supplier/supplierRoutes.js";
//admin reference
import statusRoutes from "./routes/admin/statusRoutes.js";
//reference
import appRoutes from "./routes/reference/appRoutes.js";
import appKeyRoutes from "./routes/reference/appKeyRoutes.js";
import allergenRoutes from "./routes/reference/allergenRoutes.js";
import businessRoutes from "./routes/reference/businessRoutes.js";
import businessTypeRoutes from "./routes/reference/businessTypeRoutes.js";
import equipmentCategoryRoutes from "./routes/reference/equipmentCategoryRoutes.js";
import footerRoutes from "./routes/reference/footerRoutes.js";
import holidayRoutes from "./routes/reference/holidayRoutes.js";
import imperialUnitRoutes from "./routes/reference/ImperialUnitRoutes.js";
import metricUnitRoutes from "./routes/reference/MetricUnitRoutes.js";
import occasionRoutes from "./routes/reference/occasionRoutes.js";
import receiptFooterRoutes from "./routes/reference/receiptFooterRoutes.js";
import receiptHeaderRoutes from "./routes/reference/receiptHeaderRoutes.js";
import receiptSubHeaderRoutes from "./routes/reference/receiptSubHeaderRoutes.js";
import receiptTemplateRoutes from "./routes/reference/receiptTemplateRoutes.js";
import seasonRoutes from "./routes/reference/seasonRoutes.js";
import supplyCategoryRoutes from "./routes/reference/supplyCategoryRoutes.js";
import taglineRoutes from "./routes/reference/taglineRoutes.js";
import taskPriorityRoutes from "./routes/reference/taskPriorityRoutes.js";
import taskStatusRoutes from "./routes/reference/taskStatusRoutes.js";
import taxRateRoutes from "./routes/reference/taxRateRoutes.js";
import vendorRoutes from "./routes/reference/vendorRoutes.js";
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
import userDepartmentAssignmentRoutes from "./routes/users/userDepartmentAssignmentRoutes.js";
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
app.use(express.json());
app.use(express.urlencoded({extended:true}));
const corsOrigins=(process.env.CORS_ORIGIN||"").split(",").map(origin=>origin.trim()).filter(Boolean);
const corsConfig={origin:corsOrigins.length?corsOrigins:true,credentials:true};
app.use(cors(corsConfig));
app.use(cookieParser());
const io=new Server(server,{
 cors:corsConfig
});
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
const sanitizeFileName=value=>{
 return String(value||"file")
  .replace(/\\/g,"/")
  .split("/")
  .pop()
  .replace(/[<>:"/\\|?*\x00-\x1F]/g,"_")
  .replace(/\s+/g,"-")
  .replace(/-+/g,"-")
  .trim();
};
const removeLeadingNumberPrefix=value=>{
 const safeName=sanitizeFileName(value);
 const cleanName=safeName.replace(/^(\d+[-_\s]+)+/,"");
 return cleanName||safeName;
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
  const safeName=sanitizeFileName(file.originalname);
  cb(null,safeName);
 }
});
const upload=multer({
 storage,
 limits:{fileSize:parseInt(process.env.UPLOAD_MAX_SIZE,10)||26214400}
});
/* API's */
app.get("/api/health",(req,res)=>{res.json({status:"ok"});});
//location
app.use("/api/states",stateRoutes);
app.use("/api/countries",countryRoutes);
app.use("/api/counties",countyRoutes);
//finance
app.use("/api/electricity-accounts",electricityAccountRoutes);
app.use("/api/electricity-rates",electricityRateRoutes);
app.use("/api/fuel-accounts",fuelAccountRoutes);
app.use("/api/fuel-rates",fuelRateRoutes);
app.use("/api/fuel-sources",fuelSourceRoutes);
//dehydration
app.use("/api/dehydration-setups",dehydrationSetupRoutes);
app.use("/api/dehydration-processes",dehydrationProcessRoutes);
app.use("/api/dehydrators",dehydratorRoutes);
//products
app.use("/api/products",productRoutes);
app.use("/api/product-batches",productBatchRoutes);
//menu
app.use("/api/menus",menuRoutes);
app.use("/api/menu-items",menuItemRoutes);
//orders
app.use("/api/customers",customerRoutes);
app.use("/api/clients",customerRoutes);
app.use("/api/events",eventRoutes);
app.use("/api/orders",orderRoutes);
//inventory
app.use("/api/inventory",inventoryRoutes);
app.use("/api/storage-locations",storageLocationRoutes);
//supplier
app.use("/api/suppliers",supplierRoutes);
//admin reference
app.use("/api/statuses",statusRoutes);
//reference
app.use("/api/app",appRoutes);
app.use("/api/app-keys",appKeyRoutes);
app.use("/api/allergens",allergenRoutes);
app.use("/api/businesses",businessRoutes);
app.use("/api/business",businessRoutes);
app.use("/api/business-types",businessTypeRoutes);
app.use("/api/equipment-categories",equipmentCategoryRoutes);
app.use("/api/footers",footerRoutes);
app.use("/api/holidays",holidayRoutes);
app.use("/api/imperial-units",imperialUnitRoutes);
app.use("/api/metric-units",metricUnitRoutes);
app.use("/api/occasions",occasionRoutes);
app.use("/api/receipt-footers",receiptFooterRoutes);
app.use("/api/receipt-headers",receiptHeaderRoutes);
app.use("/api/receipt-sub-headers",receiptSubHeaderRoutes);
app.use("/api/receipt-templates",receiptTemplateRoutes);
app.use("/api/seasons",seasonRoutes);
app.use("/api/supply-categories",supplyCategoryRoutes);
app.use("/api/taglines",taglineRoutes);
app.use("/api/task-priorities",taskPriorityRoutes);
app.use("/api/task-statuses",taskStatusRoutes);
app.use("/api/tax-rates",taxRateRoutes);
app.use("/api/vendors",vendorRoutes);
// user api
app.use("/api/users/details",userDetailsRoutes);
app.use("/api/users/roles",userRolesRoutes);
app.use("/api/users/role-assignments",userRoleAssignmentRoutes);
app.use("/api/users/role-permissions",rolePermissionRoutes);
app.use("/api/users/user-permission-overrides",userPermissionOverrideRoutes);
app.use("/api/users/effective-permissions",effectivePermissionRoutes);
app.use("/api/users/permissions",permissionRoutes);
app.use("/api/users/permission-modules",permissionModuleRoutes);
app.use("/api/users/business-departments",businessDepartmentRoutes);
app.use("/api/users/departments",businessDepartmentRoutes);
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