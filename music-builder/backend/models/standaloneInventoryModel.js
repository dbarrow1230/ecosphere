import mongoose from "mongoose";
import {inventoryFields} from "../../../shared/backend/standaloneResourceSchemas.js";
const schema=new mongoose.Schema(inventoryFields,{timestamps:true,collection:"inventory"});
export default mongoose.models.StandaloneInventory||mongoose.model("StandaloneInventory",schema);
