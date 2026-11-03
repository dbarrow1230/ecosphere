import mongoose from "mongoose";

// Eco Sphere supplies the identity database when launching a child app.
// Standalone installations use their configured default database.
const coreConnection=process.env.ECOSPHERE_MONGO_URI
 ?mongoose.createConnection(process.env.ECOSPHERE_MONGO_URI)
 :mongoose.connection;

export default coreConnection;
