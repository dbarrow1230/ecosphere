import express from "express";
import http from "http";
import mongoose from "mongoose";
import cors from "cors";
import path from "path";
import fs from "fs";
import {fileURLToPath} from "url";
import {spawn} from "child_process";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import multer from "multer";
import {Server} from "socket.io";
import initializeMeetingMethods from "./services/meetingMethodInitializer.js";
import initializeFileLookups from "./services/fileLookupInitializer.js";
import initializeMenteeResourceIndexes from "./services/menteeResourceIndexInitializer.js";

/* models */
import menteeRoutes from "./routes/menteeRoutes.js";
import mentorNoteRoutes from "./routes/mentorNoteRoutes.js";
import smartGoalRoutes from "./routes/smartGoalRoutes.js";
import statusRoutes from "./routes/statusRoutes.js";
import timesheetRoutes from "./routes/timesheetRoutes.js";
import weeklySessionRoutes from "./routes/weeklySessionRoutes.js";
import programRoutes from "./routes/programRoutes.js";
import meetingMethodRoutes from "./routes/meetingMethodRoutes.js";
import fileLookupRoutes from "./routes/fileLookupRoutes.js";
import menteeFileRoutes from "./routes/menteeFileRoutes.js";
import mentorshipTrackerRoutes from "./routes/mentorshipTrackerRoutes.js";
import reminderRoutes from "./routes/reminderRoutes.js";
import taskRoutes from "./routes/taskRoutes.js";

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
import vendorRoutes from "./routes/reference/vendorRoutes.js";
import receiptTemplateRoutes from "./routes/reference/receiptTemplateRoutes.js";
import receiptHeaderRoutes from "./routes/reference/receiptHeaderRoutes.js";
import receiptSubHeaderRoutes from "./routes/reference/receiptSubHeaderRoutes.js";
import receiptFooterRoutes from "./routes/reference/receiptFooterRoutes.js";
import imperialUnitRoutes from "./routes/reference/ImperialUnitRoutes.js";
import metricUnitRoutes from "./routes/reference/MetricUnitRoutes.js";
import locationTypeRoutes from "./routes/reference/LocationTypeRoutes.js";
import locationRoutes from "./routes/reference/LocationRoutes.js";
import taxRateRoutes from "./routes/reference/taxRateRoutes.js";

/* calendar */
import calendarEventRoutes from "./routes/calendarEventRoutes.js";

//resource
import resourceRoutes from "./routes/resources/resourceRoutes.js";
import resourceCategoryRoutes from "./routes/resources/resourceCategoryRoutes.js";

/* users */
import userDetailsRoutes from "./routes/users/userDetailsRoutes.js";
import userRoutes from "./routes/users/userRoutes.js";
import userRolesRoutes from "./routes/users/userRolesRoutes.js";
import userRoleAssignmentRoutes from "./routes/users/userRoleAssignmentRoutes.js";
import rolePermissionRoutes from "./routes/users/rolePermissionRoutes.js";
import userPermissionOverrideRoutes from "./routes/users/userPermissionOverrideRoutes.js";
import effectivePermissionRoutes from "./routes/users/effectivePermissionRoutes.js";

import categoryRoutes from "./routes/master/CategoryRoutes.js";
import courseRoutes from "./routes/master/CourseRoutes.js";
import cuisineRoutes from "./routes/master/CuisineRoutes.js";
import dietaryRoutes from "./routes/master/DietaryRoutes.js";
import recipeRoutes from "./routes/master/RecipeRoutes.js";
import recipeCostingRoutes from "./routes/master/RecipeCostingRoutes.js";
import vendorCategoryRoutes from "./routes/master/VendorCategoryRoutes.js";
import vendorIngredientPriceRoutes from "./routes/master/VendorIngredientPriceRoutes.js";

/* app */
import appModuleRoutes from "./routes/app/appModuleRoutes.js";
import appRoutes from "./routes/app/appRoutes.js";

/* reminder */
import {registerReminderSocket} from "./socket/reminderSocket.js";
import {startReminderCron} from "./jobs/reminderCron.js";

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
  try{
   const target=getUploadFolder(req);
   const originalName=String(file.originalname||"").replace(/\\/g,"/").split("/").pop();

   if(!target)return cb(new Error("Invalid upload directory"));
   if(!originalName||/[<>:"/\\|?*\x00-\x1F]/.test(originalName)){
    const error=new Error("The original filename contains characters that cannot be stored.");
    error.code="INVALID_UPLOAD_FILENAME";
    return cb(error);
   }

   if(fs.existsSync(path.join(target.dirPath,originalName))){
    const error=new Error(`A file named "${originalName}" already exists.`);
    error.code="UPLOAD_FILE_EXISTS";
    return cb(error);
   }

   cb(null,originalName);
  }catch(error){
   cb(error);
  }
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

/* reference data routes */
app.use("/api/businesses",businessRoutes);
app.use("/api/business-types",businessTypeRoutes);
app.use("/api/app-keys",appKeyRoutes);
app.use("/api/footers",footerRoutes);
app.use("/api/seasons",seasonRoutes);
app.use("/api/taglines",taglineRoutes);
app.use("/api/occasions",occasionRoutes);
app.use("/api/holidays",holidayRoutes);
app.use("/api/vendors",vendorRoutes);
app.use("/api/receipt-templates",receiptTemplateRoutes);
app.use("/api/receipt-headers",receiptHeaderRoutes);
app.use("/api/receipt-sub-headers",receiptSubHeaderRoutes);
app.use("/api/receipt-footers",receiptFooterRoutes);
app.use("/api/imperial-units",imperialUnitRoutes);
app.use("/api/metric-units",metricUnitRoutes);
app.use("/api/location-types",locationTypeRoutes);
app.use("/api/locations",locationRoutes);
app.use("/api/tax-rates",taxRateRoutes);

/* user api */
app.use("/api/users/details",userDetailsRoutes);
app.use("/api/users/roles",userRolesRoutes);
app.use("/api/users/role-assignments",userRoleAssignmentRoutes);
app.use("/api/users/role-permissions",rolePermissionRoutes);
app.use("/api/users/user-permission-overrides",userPermissionOverrideRoutes);
app.use("/api/users/effective-permissions",effectivePermissionRoutes);
app.use("/api/users",userRoutes);
app.use("/api/categories",categoryRoutes);
app.use("/api/courses",courseRoutes);
app.use("/api/cuisines",cuisineRoutes);
app.use("/api/dietaries",dietaryRoutes);
app.use("/api/recipes",recipeRoutes);
app.use("/api/recipe-costings",recipeCostingRoutes);
app.use("/api/vendor-categories",vendorCategoryRoutes);
app.use("/api/vendor-ingredient-prices",vendorIngredientPriceRoutes);

/* calendar */
app.use("/api/calendar-events",calendarEventRoutes);

/* resource */
app.use("/api/resources",resourceRoutes);
app.use("/api/resource-categories",resourceCategoryRoutes);

/* mentee routes */
app.use("/api/mentees",menteeRoutes);
app.use("/api/mentor-notes",mentorNoteRoutes);
app.use("/api/smart-goals",smartGoalRoutes);
app.use("/api/statuses",statusRoutes);
app.use("/api/timesheets",timesheetRoutes);
app.use("/api/weekly-sessions",weeklySessionRoutes);
app.use("/api/programs",programRoutes);
app.use("/api/meeting-methods",meetingMethodRoutes);
app.use("/api/file-lookups",fileLookupRoutes);
app.use("/api/mentee-files",menteeFileRoutes);
app.use("/api/mentorship-trackers",mentorshipTrackerRoutes);

/* reminder routes */
app.use("/api/reminders",reminderRoutes);
app.use("/api/tasks",taskRoutes);

/* location routes */
app.use("/api/states",stateRoutes);
app.use("/api/countries",countryRoutes);
app.use("/api/counties",countyRoutes);

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

 if(err?.code==="UPLOAD_FILE_EXISTS"){
  return res.status(409).json({success:false,message:err.message});
 }

 if(err?.code==="INVALID_UPLOAD_FILENAME"){
  return res.status(400).json({success:false,message:err.message});
 }

 if(err?.message==="Invalid upload directory"){
  return res.status(400).json({success:false,message:err.message});
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

let businessConnection=null;

const startApp=async()=>{
 if(!process.env.MONGO_URI)throw new Error("MONGO_URI is not defined");

 await waitForMongo(process.env.MONGO_URI);
 await initializeMeetingMethods();
 await initializeFileLookups();
 await initializeMenteeResourceIndexes();

 if(process.env.MONGO_BUSINESS_URI){
  businessConnection=await mongoose.createConnection(process.env.MONGO_BUSINESS_URI).asPromise();
  console.log("Business MongoDB connected");
 }

 registerReminderSocket(io);
 startReminderCron(io);

 server.listen(PORT,()=>{
  console.log(`Backend running on port ${PORT}`);
 });
};

await startApp();

const shutdown=async(signal="SIGTERM")=>{
 if(isShuttingDown)return;
 isShuttingDown=true;

 try{
  console.log(`Received ${signal}. Shutting down...`);

  if(server)await new Promise(resolve=>server.close(resolve));
  if(mongoose.connection.readyState===1)await mongoose.connection.close();
  if(businessConnection&&businessConnection.readyState===1)await businessConnection.close();



  process.exit(0);
 }catch(err){
  console.error(err);
  process.exit(1);
 }
};

process.on("SIGINT",()=>shutdown("SIGINT"));
process.on("SIGTERM",()=>shutdown("SIGTERM"));