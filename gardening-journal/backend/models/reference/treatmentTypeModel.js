import mongoose from "mongoose";

// Reference-only scaffold for the existing TreatmentType refs. No seed data,
// collection creation, or index migration is performed during registration.
const treatmentTypeSchema=new mongoose.Schema({
 name:{type:String,trim:true},
 description:{type:String,trim:true},
 isActive:{type:Boolean,default:true}
},{timestamps:true,autoCreate:false,autoIndex:false});

export default mongoose.models.TreatmentType||mongoose.model("TreatmentType",treatmentTypeSchema);
