import mongoose from "mongoose";
import {menuFields} from "../../../shared/backend/standaloneResourceSchemas.js";
const schema=new mongoose.Schema(menuFields,{timestamps:true,collection:"menus"});
export default mongoose.models.StandaloneMenu||mongoose.model("StandaloneMenu",schema);
