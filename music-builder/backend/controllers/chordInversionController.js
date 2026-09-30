import ChordInversion from "../models/chordInversionModel.js";

export const getChordInversions=async(req,res,next)=>{
 try{
  res.json(await ChordInversion.find({isActive:true}).sort({sortOrder:1,name:1}));
 }catch(error){next(error);}
};
