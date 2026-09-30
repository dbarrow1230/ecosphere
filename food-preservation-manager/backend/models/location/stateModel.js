// backend/models/stateModel.js
import mongoose from "mongoose";
import businessInfoConnection from "../../db/businessInfoConnection.js";
const stateSchema=new mongoose.Schema(
{
name:{type:String,required:true,trim:true},
abbreviation:{type:String,required:true,trim:true,uppercase:true}
},
{timestamps:true,collection:"states"}
);

stateSchema.index({name:1},{unique:true});
stateSchema.index({abbreviation:1},{unique:true});

const State=businessInfoConnection.models.State||businessInfoConnection.model("State",stateSchema);

export default State;