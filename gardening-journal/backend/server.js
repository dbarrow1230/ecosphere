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

/* routes */
import stateRoutes from "./routes/locations/stateRoutes.js";
import countryRoutes from "./routes/locations/countryRoutes.js";
import countyRoutes from "./routes/locations/countyRoutes.js";

//cron
import startReminderJob from "./jobs/reminderJob.js";

//dashboards
import dashboardSnapShotRoutes from "./routes/dashboard/dashboardSnapshotRoutes.js";
import dashboardRoutes from "./routes/dashboard/dashboardRoutes.js";

// reference
import usdaZonesRoutes from "./routes/reference/usdaZonesRoutes.js";
import fertilizerRoutes from "./routes/reference/fertilizerRoutes.js";
import conditionScaleRoutes from "./routes/reference/conditionScaleRoutes.js";
import diseaseRefTreatmentRoutes from "./routes/reference/diseaseRefTreatmentRoutes.js";
import equipmentCategoryRoutes from "./routes/reference/equipmentCategoryRoutes.js";
import fertilizerTypeRoutes from "./routes/reference/fertilizerTypeRoutes.js";
import lightingRoutes from "./routes/reference/lightingRoutes.js";
import pestRefTreatmentRoutes from "./routes/reference/pestRefTreatmentRoutes.js";
import plantCategoryRoutes from "./routes/reference/plantCategoryRoutes.js";
import plantTypeRoutes from "./routes/reference/plantTypeRoutes.js";
import seasonRoutes from "./routes/reference/seasonRoutes.js";
import severityScaleRoutes from "./routes/reference/severityScaleRoutes.js";
import soilTypeRoutes from "./routes/reference/soilTypeRoutes.js";
import supplyCategoryRoutes from "./routes/reference/supplyCategoryRoutes.js";
import weatherObservationRoutes from "./routes/reference/weatherObservationRoutes.js";
import taskStatusRoutes from "./routes/reference/taskStatusRoutes.js";
import taskPriorityRoutes from "./routes/reference/taskPriorityRoutes.js";
import businessRoutes from "./routes/reference/businessRoutes.js";
import businessTypeRoutes from "./routes/reference/businessTypeRoutes.js";
import appKeyRoutes from "./routes/reference/appKeyRoutes.js";
import footerRoutes from "./routes/reference/footerRoutes.js";
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
import lifecycleRoutes from './routes/reference/lifecycleRoutes.js';
import plantSpacingRoutes from './routes/reference/plantSpacingRoutes.js';
import sunlightRequirementRoutes from './routes/reference/sunlightRequirementRoutes.js';
import plantSoilTempRoutes from "./routes/reference/plantSoilTempRoutes.js";
import wateringRequirementRoutes from "./routes/reference/wateringRequirementRoutes.js";
import plantingSeasonRoutes from "./routes/reference/plantingSeasonRoutes.js";
import propagationMethodRoutes from "./routes/reference/propagationMethodRoutes.js";
import lifespanRoutes from "./routes/reference/lifespanRoutes.js";

//fertilizer application routes
import fertilizerApplicationRoutes from "./routes/fertilizers/fertilizerApplicationRoutes.js";

// seed
import seedRoutes from "./routes/seed/seedRoutes.js";
import seedCollectionRoutes from "./routes/seed/seedCollectionRoutes.js";

//supply
import supplyRoutes from "./routes/supplies/supplyRoutes.js";

//species
import speciesRoutes from "./routes/species/speciesRoutes.js";
import familyRoutes from "./routes/species/familyRoutes.js";
import genusRoutes from "./routes/species/genusRoutes.js";

//diseases
import diseaseRoutes from "./routes/diseases/diseaseRoutes.js";
import diseaseLogRoutes from "./routes/diseases/diseaseLogRoutes.js";

//equipment
import equipmentRoutes from "./routes/equipment/equipmentRoutes.js";

//hydroponics
import hydroSystemRoutes from "./routes/hydroponics/hydroSystemRoutes.js";

//harvest
import harvestRoutes from "./routes/harvest/harvestRoutes.js";
import harvestQualityScaleRoutes from "./routes/reference/harvestQualityScaleRoutes.js";

//gardens
import gardenRoutes from "./routes/gardens/gardenRoutes.js";
import gardenNoteRoutes from "./routes/gardens/gardenNoteRoutes.js";
import gardenSectionRoutes from "./routes/gardens/gardenSectionRoutes.js";
import gardenReferenceRoutes from "./routes/gardens/gardenReferenceRoutes.js";

//journal
import activityRoutes from "./routes/journal/activityRoutes.js";
import dailyJournalRoutes from "./routes/journal/dailyJournalRoutes.js";
import journalEntryRoutes from "./routes/journal/journalEntryRoutes.js";
import observationRoutes from "./routes/journal/observationRoutes.js";

//media
import mediaRoutes from "./routes/media/mediaRoutes.js";

//growth
import growthRateRoutes from './routes/growth/growthRateRoutes.js';
import plantingDepthRoutes from './routes/growth/plantingDepthRoutes.js';


//vendors
import equipmentVendorRoutes from "./routes/vendors/equipmentVendorRoutes.js";
import seedVendorRoutes from "./routes/vendors/seedVendorRoutes.js";
import supplyVendorRoutes from "./routes/vendors/supplyVendorRoutes.js";

//tasks
import taskRoutes from "./routes/tasks/taskRoutes.js";
import taskReminderRoutes from "./routes/tasks/taskReminderRoutes.js";

//plants
import plantingRoutes from "./routes/plants/plantingRoutes.js";
import plantRoutes from "./routes/plants/plantRoutes.js";
import plantStageRoutes from "./routes/plants/plantStageRoutes.js";
import plantVarietyRoutes from "./routes/plants/plantVarietyRoutes.js";

//pests
import pestRoutes from "./routes/pest/pestRoutes.js";
import pestLogRoutes from "./routes/pest/pestLogRoutes.js";
import pestTypeRoutes from "./routes/pest/pestTypeRoutes.js";
import issueRoutes from "./routes/issues/issueRoutes.js";

// users
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
import permissionModuleRoutes from "./routes/users/permissionModuleRoutes.js";
import businessDepartmentRoutes from "./routes/users/businessDepartmentRoutes.js";
import userDepartmentAssignmentRoutes from "./routes/users/userDepartmentAssignmentRoutes.js";

/* app */
import appModuleRoutes from "./routes/app/appModuleRoutes.js";
import appRoutes from "./routes/app/appRoutes.js";

/* reminder */
import {registerReminderSocket} from "./socket/reminderSocket.js";
import {startReminderCron} from "./jobs/reminderCron.js";
import reminderRoutes from "./routes/reminderRoutes.js";
import {startNOAAJobs} from "./jobs/noaa.js";

/**weather */
import weatherRoutes from "./routes/weather/weatherRoutes.js";

/* error middleware */
import {notFound,errorHandler} from "./middleware/errorMiddleware.js";

const app=express();
const server=http.createServer(app);
const PORT=process.env.PORT||6012;

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

 // Seed images always live directly in backend/public/seed.
 if(dir==="seed"){
  return{dir,dirPath:uploadDirs[dir],relativeDir:dir};
 }

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
 const originalName=String(file.originalname||"file").replace(/\\/g,"/").split("/").pop();
 const safeName=originalName.replace(/[<>:"/\\|?*\x00-\x1F]/g,"_");
 const dir=String(req.params.dir||req.body.dir||req.query.dir||"").trim();
 if(dir==="logos"||dir==="seed"){
  cb(null,safeName);
  return;
 }
 cb(null,`${Date.now()}-${safeName}`);
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

// shared location routes
app.use("/api/states",stateRoutes);
app.use("/api/countries",countryRoutes);
app.use("/api/counties",countyRoutes);

//growth routes
app.use("/api/growth-rates",growthRateRoutes);
app.use("/api/planting-depths",plantingDepthRoutes);

// reference api
app.use("/api/reference/usda-zones",usdaZonesRoutes);
app.use("/api/reference/fertilizers",fertilizerRoutes);
app.use("/api/condition-scales",conditionScaleRoutes);
app.use("/api/disease-ref-treatments",diseaseRefTreatmentRoutes);
app.use("/api/equipment-categories",equipmentCategoryRoutes);
app.use("/api/fertilizer-types",fertilizerTypeRoutes);
app.use("/api/lighting",lightingRoutes);
app.use("/api/pest-ref-treatments",pestRefTreatmentRoutes);
app.use("/api/plant-categories",plantCategoryRoutes);
app.use("/api/plant-types",plantTypeRoutes);
app.use("/api/seasons",seasonRoutes);
app.use("/api/severity-scales",severityScaleRoutes);
app.use("/api/soil-types",soilTypeRoutes);
app.use("/api/supply-categories",supplyCategoryRoutes);
app.use("/api/reference/weather-observations",weatherObservationRoutes);
app.use('/api/reference/lifecycles', lifecycleRoutes);
app.use("/api/reference/plant-spacings",plantSpacingRoutes);
app.use("/api/reference/sunlight-requirements",sunlightRequirementRoutes);
app.use("/api/reference/plant-soil-temps",plantSoilTempRoutes);
app.use("/api/reference/watering-requirements",wateringRequirementRoutes);
app.use("/api/reference/propagation-methods",propagationMethodRoutes);
app.use("/api/reference/lifespans",lifespanRoutes);

// shared reference routes
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

// seed api
app.use("/api/seeds",seedRoutes);
app.use("/api/seed-collections",seedCollectionRoutes);

//species api
app.use("/api/species",speciesRoutes);
app.use("/api/families",familyRoutes);
app.use("/api/genus", genusRoutes);

//deseases api
app.use("/api/diseases",diseaseRoutes);
app.use("/api/disease-logs",diseaseLogRoutes);

//equipment api
app.use("/api/equipment",equipmentRoutes);

//hydroponics api
app.use("/api/hydro-systems",hydroSystemRoutes);

//garden api
app.use("/api/gardens",gardenRoutes);
app.use("/api/garden-notes",gardenNoteRoutes);
app.use("/api/garden-sections",gardenSectionRoutes);
app.use("/api/garden-references",gardenReferenceRoutes);

//supply api
app.use("/api/supplies",supplyRoutes);

//journal api
app.use("/api/activities",activityRoutes);
app.use("/api/daily-journals",dailyJournalRoutes);
app.use("/api/journal-entries",journalEntryRoutes);
app.use("/api/observations",observationRoutes);

//fertilizer application api
app.use("/api/fertilizer-applications",fertilizerApplicationRoutes);

//media api
app.use("/api/media",mediaRoutes);

//vendor api
app.use("/api/equipment-vendors",equipmentVendorRoutes);
app.use("/api/seed-vendors",seedVendorRoutes);
app.use("/api/supply-vendors",supplyVendorRoutes);

//tasks api
app.use("/api/task-reminders",taskReminderRoutes);
app.use("/api/tasks",taskRoutes);
app.use("/api/task-statuses",taskStatusRoutes);
app.use("/api/task-priorities",taskPriorityRoutes);

//harvest api
app.use("/api/harvests",harvestRoutes);
app.use("/api/harvest-quality-scales",harvestQualityScaleRoutes);

//pest api
app.use("/api/pest-logs",pestLogRoutes);
app.use("/api/pests",pestRoutes);
app.use("/api/pest-types",pestTypeRoutes);
app.use("/api/issues",issueRoutes);


//plants api
app.use("/api/plantings",plantingRoutes);
app.use("/api/plants",plantRoutes);
app.use("/api/plant-stages",plantStageRoutes);
app.use("/api/plant-varieties",plantVarietyRoutes);

// shared user api
app.use("/api/users/details",userDetailsRoutes);
app.use("/api/users/roles",userRolesRoutes);
app.use("/api/users/permission-modules",permissionModuleRoutes);
app.use("/api/users/departments",businessDepartmentRoutes);
app.use("/api/users/business-departments",businessDepartmentRoutes);
app.use("/api/users/department-assignments",userDepartmentAssignmentRoutes);
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
app.use("/api/reference/planting-seasons",plantingSeasonRoutes);

/**dahbaords */
app.use("/api/boardjournal",dashboardSnapShotRoutes);
app.use("/api/dashboard",dashboardRoutes);
/**weather */
app.use("/api/weather",weatherRoutes);
/* reminder routes */
app.use("/api/reminders",reminderRoutes);

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

const normalizeExistingSeedImages=async()=>{
 const seedDir=uploadDirs.seed;
 if(!seedDir)return;

 const seeds=mongoose.connection.collection("seeds");
 const cursor=seeds.find({}, {projection:{coverImage:1,images:1}});
 let repaired=0;

 for await(const seed of cursor){
  const normalizeFilename=value=>{
   const raw=String(value||"").trim().split(/[?#]/,1)[0].replace(/\\/g,"/").split("/").pop();
   return raw.replace(/^\d{13}-(?=.)/,"");
  };
  const copyLegacyFile=value=>{
   const sourceName=String(value||"").trim().split(/[?#]/,1)[0].replace(/\\/g,"/").split("/").pop();
   const filename=normalizeFilename(value);
   if(!sourceName||!filename||sourceName===filename)return;
   const source=path.join(seedDir,sourceName);
   const destination=path.join(seedDir,filename);
   if(fs.existsSync(source)&&!fs.existsSync(destination))fs.copyFileSync(source,destination);
  };

  copyLegacyFile(seed.coverImage);
  const coverImage=normalizeFilename(seed.coverImage);
  const images=Array.isArray(seed.images) ? seed.images.map(image=>{
   const source=image?.filename || image?.url || image?.relativePath;
   copyLegacyFile(source);
   return {...image,filename:normalizeFilename(source),url:undefined,relativePath:undefined};
  }) : [];

  const oldCover=String(seed.coverImage||"");
  const imageChanged=JSON.stringify(images)!==JSON.stringify(seed.images||[]);
  if(coverImage!==oldCover||imageChanged){
   await seeds.updateOne({_id:seed._id},{$set:{coverImage,images}});
   repaired++;
  }
 }

 if(repaired)console.log(`Normalized seed image filenames for ${repaired} seed records`);
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
 await normalizeExistingSeedImages();

 startKeyboardShutdown();

 server.listen(PORT,()=>{
  console.log(`Backend running on port ${PORT}`);
 });
};

process.on("SIGINT",()=>shutdown("SIGINT"));
process.on("SIGTERM",()=>shutdown("SIGTERM"));

await startApp();
