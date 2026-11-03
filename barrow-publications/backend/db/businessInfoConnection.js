// backend/db/businessInfoConnection.js
import mongoose from "mongoose";

const businessInfoConnection=mongoose.createConnection(process.env.MONGO_BUSINESS_URI);

businessInfoConnection.on("connected",()=>{
 console.log("Business DB connected");
});

businessInfoConnection.on("error",(err)=>{
 console.error("Business DB connection error:",err);
});

export default businessInfoConnection;