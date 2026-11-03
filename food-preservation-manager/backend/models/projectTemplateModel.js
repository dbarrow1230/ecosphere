// backend/models/projectTemplateModel.js
import mongoose from "mongoose";

const d=v=>v==null||v===""?v:mongoose.Types.Decimal128.fromString(String(v));

const templateOptionValueSchema=new mongoose.Schema({
 label:{type:String,required:true,trim:true},
 value:{type:String,required:true,trim:true},
 description:{type:String,trim:true,default:""},
 isDefault:{type:Boolean,default:false},
 sortOrder:{type:Number,default:0},
 isActive:{type:Boolean,default:true}
},{_id:false});

const templateOptionSchema=new mongoose.Schema({
 key:{type:String,required:true,trim:true}, // jarSize, methodType, packageType
 label:{type:String,required:true,trim:true},
 type:{type:String,trim:true,default:"select"}, // select, multiselect, radio, checkbox
 values:[templateOptionValueSchema],
 sortOrder:{type:Number,default:0},
 isActive:{type:Boolean,default:true}
},{_id:false});

const templateChecklistItemSchema=new mongoose.Schema({
 label:{type:String,required:true,trim:true},
 code:{type:String,trim:true,default:""},
 description:{type:String,trim:true,default:""},
 sortOrder:{type:Number,default:0},
 isActive:{type:Boolean,default:true}
},{_id:false});

const templateInstructionSchema=new mongoose.Schema({
 step:{type:Number,default:0},
 title:{type:String,trim:true,default:""},
 instruction:{type:String,trim:true,default:""},
 sortOrder:{type:Number,default:0},
 isActive:{type:Boolean,default:true}
},{_id:false});

const templateScheduleItemSchema=new mongoose.Schema({
 label:{type:String,trim:true,default:""},
 action:{type:String,trim:true,default:""},
 offsetValue:{type:Number,default:0},
 offsetUnit:{type:String,trim:true,default:""}, // minutes, hours, days
 sortOrder:{type:Number,default:0},
 isActive:{type:Boolean,default:true}
},{_id:false});

const projectTemplateSchema=new mongoose.Schema({
 name:{type:String,required:true,trim:true},
 code:{type:String,trim:true,default:"",unique:true,sparse:true},
 description:{type:String,trim:true,default:""},

 preservationProject:{type:mongoose.Schema.Types.ObjectId,ref:"PreservationProject",required:true},

 preservationMethod:{type:String,trim:true,default:""}, // dehydration, canning, fermentation, etc
 templateType:{type:String,trim:true,default:""}, // waterBath, pressureCanning, jamJelly, lacto, dough

 defaultSettings:{
  equipment:{type:mongoose.Schema.Types.Mixed,default:{}},
  parameters:{type:mongoose.Schema.Types.Mixed,default:{}},
  estimated:{
   duration:{type:String,trim:true,default:""},
   energyConsumption:{
    min:{type:mongoose.Schema.Types.Decimal128,set:d},
    max:{type:mongoose.Schema.Types.Decimal128,set:d}
   },
   energyCost:{
    min:{type:mongoose.Schema.Types.Decimal128,set:d},
    max:{type:mongoose.Schema.Types.Decimal128,set:d}
   }
  },
  yield:{
   quantity:{type:Number,default:0},
   unit:{type:String,trim:true,default:""}
  }
 },

 options:[templateOptionSchema],

 instructions:{
  preparation:[templateInstructionSchema],
  processing:[templateInstructionSchema],
  storage:[templateInstructionSchema],
  notes:{type:String,trim:true,default:""}
 },

 defaultSchedule:[templateScheduleItemSchema],

 defaultOutcomes:[templateChecklistItemSchema],
 defaultFlags:[templateChecklistItemSchema],

 pricingDefaults:{type:mongoose.Schema.Types.Mixed,default:{}},
 packagingDefaults:{type:mongoose.Schema.Types.Mixed,default:{}},
 storageDefaults:{type:mongoose.Schema.Types.Mixed,default:{}},

 isActive:{type:Boolean,default:true},
 notes:{type:String,trim:true,default:""}
},{timestamps:true,collection:"project_templates"});

const ProjectTemplate=mongoose.models.ProjectTemplate||mongoose.model("ProjectTemplate",projectTemplateSchema);

export default ProjectTemplate;