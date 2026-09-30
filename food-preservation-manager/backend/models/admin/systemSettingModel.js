// backend/models/admin/systemSettingModel.js
import mongoose from "mongoose";

const systemSettingSchema=new mongoose.Schema({
 key:{type:String,required:true,unique:true,trim:true},
 value:{type:mongoose.Schema.Types.Mixed},

 group:{type:String,trim:true,default:"general"},

 description:{type:String,trim:true,default:""}
},{timestamps:true,collection:"system_settings"});

const SystemSetting=mongoose.models.SystemSetting||mongoose.model("SystemSetting",systemSettingSchema);

export default SystemSetting;