import mongoose from "mongoose";

const userAccountConnection=mongoose.createConnection(process.env.MONGO_URI,{
 dbName:process.env.MONGO_USER_DB||"antinet_zettelkasten"
});

userAccountConnection.on("connected",()=>{
 console.log("User account DB connected");
});

userAccountConnection.on("error",error=>{
 console.error("User account DB connection error:",error);
});

export default userAccountConnection;
