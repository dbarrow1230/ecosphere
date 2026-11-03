import standaloneInventoryRoutes from "./routes/standaloneInventoryRoutes.js";
// backend/server.js
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

import taskRoutes from "./routes/task/taskRoutes.js";
import priorityRoutes from "./routes/priority/priorityRoutes.js";
import goalRoutes from "./routes/goal/goalRoutes.js";
import milestoneRoutes from "./routes/goal/milestoneRoutes.js";
import habitRoutes from "./routes/habit/habitRoutes.js";
import routineRoutes from "./routes/routine/routineRoutes.js";
import journalEntryRoutes from "./routes/journalEntry/journalEntryRoutes.js";
import mindfulnessRoutes from "./routes/mindfulness/mindfulnessRoutes.js";
import moodLogRoutes from "./routes/moodLog/moodLogRoutes.js";
import noteRoutes from "./routes/notes/noteRoutes.js";
import calendarEventRoutes from "./routes/calendarEvent/calendarEventRoutes.js";
import reminderRoutes from "./routes/reminders/reminderRoutes.js";
import reviewRoutes from "./routes/review/reviewRoutes.js";
import timelineRoutes from "./routes/timeline/timelineRoutes.js";
import visionBoardRoutes from "./routes/visionBoard/visionBoardRoutes.js";
import lifeThemeRoutes from "./routes/lifeTheme/lifeThemeRoutes.js";
import categoryRoutes from "./routes/category/categoryRoutes.js";
import lifeAreaRoutes from "./routes/lifeArea/lifeAreaRoutes.js";
import userSettingRoutes from "./routes/userSetting/userSettingRoutes.js";
import promptRoutes from "./routes/prompt/promptRoutes.js";
import journalPromptRoutes from "./routes/prompt/journalPromptRoutes.js";
import mindfulnessPromptRoutes from "./routes/prompt/mindfulnessPromptRoutes.js";
import habitLogRoutes from "./routes/habit/habitLogRoutes.js";
import tagRoutes from "./routes/tag/tagRoutes.js";

/* users */
import userDetailsRoutes from "./routes/users/userDetailsRoutes.js";
import userRoutes from "./routes/users/userRoutes.js";
import userRolesRoutes from "./routes/users/userRolesRoutes.js";
import userRoleAssignmentRoutes from "./routes/users/userRoleAssignmentRoutes.js";
import rolePermissionRoutes from "./routes/users/rolePermissionRoutes.js";
import userPermissionOverrideRoutes from "./routes/users/userPermissionOverrideRoutes.js";
import effectivePermissionRoutes from "./routes/users/effectivePermissionRoutes.js";
import foodCategoryRoutes from "./routes/master/FoodCategoryRoutes.js";
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
const PORT=process.env.PORT||3001;

const __filename=fileURLToPath(import.meta.url);
const __dirname=path.dirname(__filename);

let isShuttingDown=false;

/* middleware */
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({extended:true}));

const corsOrigins=(process.env.CORS_ORIGIN||"").split(",").map(origin=>origin.trim()).filter(Boolean);

app.use(cors({
 origin:corsOrigins.length?corsOrigins:true,
 credentials:true
}));

app.use(cookieParser());

const uploadRoot=path.join(__dirname,"public");
const uploadDirNames=(process.env.UPLOAD_DIRS||"images,attachments").split(",").map(dir=>dir.trim()).filter(Boolean);
const uploadDirs=uploadDirNames.reduce((acc,dir)=>{
 acc[dir]=path.join(uploadRoot,dir);
 return acc;
},{});

Object.entries(uploadDirs).forEach(([dirName,dirPath])=>{
 if(!fs.existsSync(dirPath))fs.mkdirSync(dirPath,{recursive:true});
 app.use(`/${dirName}`,express.static(dirPath));
});

/* multer */
const getUploadFolder=req=>{
 const dir=(req.params.dir||req.body.dir||req.query.dir||"").trim();

 if(!dir||!uploadDirs[dir])return null;

 return {dir,dirPath:uploadDirs[dir]};
};

const storage=multer.diskStorage({
 destination:(req,file,cb)=>{
  const target=getUploadFolder(req);

  if(!target)return cb(new Error("Invalid upload directory"));

  cb(null,target.dirPath);
 },
 filename:(req,file,cb)=>{
  cb(null,file.originalname);
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

/* lifeboard routes */
app.use("/api/tasks",taskRoutes);
app.use("/api/priorities",priorityRoutes);
app.use("/api/goals",goalRoutes);
app.use("/api/milestones",milestoneRoutes);
app.use("/api/habits",habitRoutes);
app.use("/api/routines",routineRoutes);
app.use("/api/journal",journalEntryRoutes);
app.use("/api/mindfulness",mindfulnessRoutes);
app.use("/api/mood-log",moodLogRoutes);
app.use("/api/notes",noteRoutes);
app.use("/api/calendar-events",calendarEventRoutes);
app.use("/api/reminders",reminderRoutes);
app.use("/api/reviews",reviewRoutes);
app.use("/api/timeline",timelineRoutes);
app.use("/api/vision-boards",visionBoardRoutes);
app.use("/api/life-themes",lifeThemeRoutes);
app.use("/api/categories",categoryRoutes);
app.use("/api/life-areas",lifeAreaRoutes);
app.use("/api/user-settings",userSettingRoutes);
app.use("/api/prompts/journal",journalPromptRoutes);
app.use("/api/prompts/mindfulness",mindfulnessPromptRoutes);
app.use("/api/prompts",promptRoutes);
app.use("/api/habit-logs",habitLogRoutes);
app.use("/api/tags",tagRoutes);

/* user api */
app.use("/api/users/details",userDetailsRoutes);
app.use("/api/users/roles",userRolesRoutes);
app.use("/api/users/role-assignments",userRoleAssignmentRoutes);
app.use("/api/users/role-permissions",rolePermissionRoutes);
app.use("/api/users/user-permission-overrides",userPermissionOverrideRoutes);
app.use("/api/users/effective-permissions",effectivePermissionRoutes);
app.use("/api/users",userRoutes);

/* food / recipe api */
app.use("/api/food-categories",foodCategoryRoutes);
app.use("/api/courses",courseRoutes);
app.use("/api/cuisines",cuisineRoutes);
app.use("/api/dietaries",dietaryRoutes);
app.use("/api/recipes",recipeRoutes);
app.use("/api/recipe-costings",recipeCostingRoutes);
app.use("/api/vendor-categories",vendorCategoryRoutes);
app.use("/api/vendor-ingredient-prices",vendorIngredientPriceRoutes);

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
  url:`/${target.dir}/${req.file.filename}`
 });
});

/* error middleware */
app.use("/api/inventory",standaloneInventoryRoutes);

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

let businessConnection=null;
let server=null;

const startApp=async()=>{
 if(!process.env.MONGO_URI)throw new Error("MONGO_URI is not defined");

 await waitForMongo(process.env.MONGO_URI);

 if(process.env.MONGO_BUSINESS_URI){
  businessConnection=await mongoose.createConnection(process.env.MONGO_BUSINESS_URI).asPromise();
  console.log("Business MongoDB connected");
 }

 server=app.listen(PORT,()=>{
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