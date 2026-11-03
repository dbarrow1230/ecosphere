import mongoose from "mongoose";

// The launcher supplies the EcoSphere identity database separately from this
// app's accounting database. A standalone app retains its configured user store.
const identityConnection=process.env.ECOSPHERE_MONGO_URI
 ?mongoose.createConnection(process.env.ECOSPHERE_MONGO_URI)
 :mongoose.connection;
identityConnection.on("error",()=>console.error("EcoSphere identity database connection failed."));
export default identityConnection;
