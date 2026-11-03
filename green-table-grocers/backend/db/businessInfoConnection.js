// backend/db/businessInfoConnection.js
import mongoose from "mongoose";
import dotenvx from "@dotenvx/dotenvx";
import path from "path";
import {fileURLToPath} from "url";

const __filename=fileURLToPath(import.meta.url);
const __dirname=path.dirname(__filename);
const sharedBusinessEnvironment={};

dotenvx.config({
 path:path.resolve(__dirname,"../../../backend/.env"),
 processEnv:sharedBusinessEnvironment,
 quiet:true,
 strict:true
});

const sharedBusinessUri=sharedBusinessEnvironment.MONGO_BUSINESS_URI||process.env.MONGO_BUSINESS_URI;
const businessInfoConnection=mongoose.createConnection(sharedBusinessUri);

businessInfoConnection.on("connected",()=>{
 console.log("Business DB connected");
});

businessInfoConnection.on("error",(err)=>{
 console.error("Business DB connection error:",err);
});

export default businessInfoConnection;
