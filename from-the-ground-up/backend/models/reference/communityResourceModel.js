// backend/models/reference/communityResourceModel.js
import mongoose from "mongoose";
const {Schema,model}=mongoose;

const scheduleSchema=new Schema({
 dayLabel:{type:String,trim:true,default:""},
 startTime:{type:String,trim:true,default:""},
 endTime:{type:String,trim:true,default:""},
 timeText:{type:String,trim:true,default:""},
 notes:{type:String,trim:true,default:""}
},{_id:false});

const contactSchema=new Schema({
 phone:{type:String,trim:true,default:""},
 email:{type:String,trim:true,default:""},
 website:{type:String,trim:true,default:""},
 contactName:{type:String,trim:true,default:""},
 notes:{type:String,trim:true,default:""}
},{_id:false});

const transportationSchema=new Schema({
 trains:[{type:String,trim:true}],
 buses:[{type:String,trim:true}]
},{_id:false});

const addressSchema=new Schema({
 address1:{type:String,trim:true,default:""},
 address2:{type:String,trim:true,default:""},
 city:{type:String,trim:true,default:""},
 state:{type:Schema.Types.ObjectId,ref:"State",default:null},
 country:{type:Schema.Types.ObjectId,ref:"Country",default:null},
 county:{type:Schema.Types.ObjectId,ref:"County",default:null},
 borough:{type:Schema.Types.ObjectId,ref:"Borough",default:null},
 postalCode:{type:String,trim:true,default:""},
 crossStreets:{type:String,trim:true,default:""},
 fullText:{type:String,trim:true,default:""}
},{_id:false});

const communityResourceSchema=new Schema({
 name:{type:String,required:true,trim:true},
 organization:{type:String,trim:true,default:""},
 category:{type:Schema.Types.ObjectId,ref:"ResourceCategory",default:null},
 subcategories:[{type:Schema.Types.ObjectId,ref:"ResourceCategory"}],

 description:{type:String,trim:true,default:""},
 services:[String],
 eligibility:{type:String,trim:true,default:""},
 requirements:{type:String,trim:true,default:""},
 intakeInstructions:{type:String,trim:true,default:""},

 address:addressSchema,
 contact:contactSchema,
 transportation:transportationSchema,
 schedule:[scheduleSchema],

 isWalkIn:{type:Boolean,default:false},
 appointmentRequired:{type:Boolean,default:false},
 idRequired:{type:Boolean,default:false},
 is24Hours:{type:Boolean,default:false},
 isFamilyFriendly:{type:Boolean,default:false},
 isWomenOnly:{type:Boolean,default:false},
 isMenOnly:{type:Boolean,default:false},
 youthOnly:{type:Boolean,default:false},

 notes:{type:String,trim:true,default:""},
 source:{type:String,trim:true,default:""},
 sourceDateLabel:{type:String,trim:true,default:""},

 isActive:{type:Boolean,default:true},
 createdBy:{type:Schema.Types.ObjectId,ref:"User",default:null}
},{timestamps:true,collection:"community_resources"});

const CommunityResource=mongoose.models.CommunityResource||mongoose.model("CommunityResource",communityResourceSchema);

export default CommunityResource;