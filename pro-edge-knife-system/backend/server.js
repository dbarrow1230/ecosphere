import contactRoutes from "./routes/contactRoutes.js";
import receiptFooterRoutes from "./routes/reference/receiptFooterRoutes.js";
import receiptSubHeaderRoutes from "./routes/reference/receiptSubHeaderRoutes.js";
import receiptHeaderRoutes from "./routes/reference/receiptHeaderRoutes.js";
import receiptTemplateRoutes from "./routes/reference/receiptTemplateRoutes.js";
// backend/server.js
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { exec } from "child_process";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import multer from "multer";

/* routes */
import stateRoutes from "./routes/stateRoutes.js";
import countryRoutes from "./routes/countryRoutes.js";
import countyRoutes from "./routes/countyRoutes.js";

// users
import permissionRoutes from "./routes/users/permissionRoutes.js";
import userDetailsRoutes from "./routes/users/userDetailsRoutes.js";
import userRoutes from "./routes/users/userRoutes.js";
import userRolesRoutes from "./routes/users/userRolesRoutes.js";
import catalogRoutes from "./routes/catalogRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import {ensureDefaultCatalog} from "./controllers/catalogController.js";
import appRoutes from "./routes/app/appRoutes.js";
import appModuleRoutes from "./routes/app/appModuleRoutes.js";
import businessRoutes from "./routes/reference/businessRoutes.js";
import businessTypeRoutes from "./routes/reference/businessTypeRoutes.js";
import appKeyRoutes from "./routes/reference/appKeyRoutes.js";
import footerRoutes from "./routes/reference/footerRoutes.js";
import seasonRoutes from "./routes/reference/seasonRoutes.js";
import taglineRoutes from "./routes/reference/taglineRoutes.js";
import occasionRoutes from "./routes/reference/occasionRoutes.js";
import holidayRoutes from "./routes/reference/holidayRoutes.js";
import taxRateRoutes from "./routes/reference/taxRateRoutes.js";
import userRoleAssignmentRoutes from "./routes/users/userRoleAssignmentRoutes.js";
import rolePermissionRoutes from "./routes/users/rolePermissionRoutes.js";
import departmentPermissionRoutes from "./routes/users/departmentPermissionRoutes.js";
import userPermissionOverrideRoutes from "./routes/users/userPermissionOverrideRoutes.js";
import effectivePermissionRoutes from "./routes/users/effectivePermissionRoutes.js";
import permissionModuleRoutes from "./routes/users/permissionModuleRoutes.js";
import businessDepartmentRoutes from "./routes/users/businessDepartmentRoutes.js";
import userDepartmentAssignmentRoutes from "./routes/users/userDepartmentAssignmentRoutes.js";

/* error middleware */
import {notFound,errorHandler} from "./middleware/errorMiddleware.js";

const app=express();
const PORT=process.env.PORT||6018;

const __filename=fileURLToPath(import.meta.url);
const __dirname=path.dirname(__filename);

/* middleware */

app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(cors());
app.use(cookieParser());

const imagesDir=path.join(__dirname,"public/images");
const attachmentsDir=path.join(__dirname,"public/attachments");

if(!fs.existsSync(imagesDir))fs.mkdirSync(imagesDir,{recursive:true});
if(!fs.existsSync(attachmentsDir))fs.mkdirSync(attachmentsDir,{recursive:true});

app.use("/images",express.static(imagesDir));
app.use("/attachments",express.static(attachmentsDir));

// multer
const getUploadFolder=(req,file)=>{
 const uploadType=(req.params.type||req.body.type||req.body.uploadType||"").toLowerCase();

 if(uploadType==="image"||file.fieldname==="image"||file.mimetype.startsWith("image/"))
  return imagesDir;

 return attachmentsDir;
};

const storage=multer.diskStorage({
 destination:(req,file,cb)=>{
  cb(null,getUploadFolder(req,file));
 },
 filename:(req,file,cb)=>{
  cb(null,file.originalname);
 }
});

const upload=multer({storage});

/* mongodb */
await mongoose.connect(process.env.MONGO_URI);
await ensureDefaultCatalog();
let businessConnection=null;
if(process.env.MONGO_BUSINESS_URI){businessConnection=await mongoose.createConnection(process.env.MONGO_BUSINESS_URI).asPromise();}

/* powershell script */

/* API's */
app.get("/api/health",(req,res)=>{res.json({status:"ok"});});

app.use("/api/states",stateRoutes);
app.use("/api/countries",countryRoutes);
app.use("/api/counties",countyRoutes);
app.use("/api/app",appRoutes);
app.use("/api/app-modules",appModuleRoutes);
app.use("/api/businesses",businessRoutes);
app.use("/api/business",businessRoutes);
app.use("/api/business-types",businessTypeRoutes);
app.use("/api/app-keys",appKeyRoutes);
app.use("/api/footers",footerRoutes);
app.use("/api/seasons",seasonRoutes);
app.use("/api/taglines",taglineRoutes);
app.use("/api/occasions",occasionRoutes);
app.use("/api/holidays",holidayRoutes);
app.use("/api/tax-rates",taxRateRoutes);

//user api
app.use("/api/users/permissions",permissionRoutes);
app.use("/api/users/details",userDetailsRoutes);
app.use("/api/users/roles",userRolesRoutes);
app.use("/api/users/role-assignments",userRoleAssignmentRoutes);
app.use("/api/users/role-permissions",rolePermissionRoutes);
app.use("/api/users/department-permissions",departmentPermissionRoutes);
app.use("/api/users/user-permission-overrides",userPermissionOverrideRoutes);
app.use("/api/users/effective-permissions",effectivePermissionRoutes);
app.use("/api/users/permission-modules",permissionModuleRoutes);
app.use("/api/users/business-departments",businessDepartmentRoutes);
app.use("/api/users/department-assignments",userDepartmentAssignmentRoutes);
app.use("/api/users",userRoutes);
app.use("/api/catalog",catalogRoutes);
app.use("/api/orders",orderRoutes);

// upload example
app.post("/api/upload/:type",upload.single("file"),(req,res)=>{
 if(!req.file)
  return res.status(400).json({success:false,message:"No file uploaded"});

 const isImage=req.params.type==="image"||req.file.mimetype.startsWith("image/");
 const folder=isImage?"images":"attachments";

 res.json({
  success:true,
  filename:req.file.filename,
  originalName:req.file.originalname,
  folder,
  url:`/${folder}/${req.file.filename}`
 });
});

/* error middleware */
app.use("/api/receipt-templates",receiptTemplateRoutes);
app.use("/api/receipt-headers",receiptHeaderRoutes);
app.use("/api/receipt-sub-headers",receiptSubHeaderRoutes);
app.use("/api/receipt-footers",receiptFooterRoutes);

app.use("/api/contact",contactRoutes);

app.use(notFound);
app.use(errorHandler);

/* start server */
const server=app.listen(PORT,()=>{console.log(`Backend running on port ${PORT}`);});

/* graceful shutdown */
const shutdown=async()=>{
 try
 {
  if(server)server.close();
  if(mongoose.connection.readyState===1)await mongoose.connection.close();
  if(businessConnection&&businessConnection.readyState===1)await businessConnection.close();
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
