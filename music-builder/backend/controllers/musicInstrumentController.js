import MusicInstrument from "../models/musicInstrumentModel.js";

export const getMusicInstruments=async(req,res,next)=>{
 try{
  res.json(await MusicInstrument.find({isActive:true}).sort({name:1}));
 }catch(error){next(error);}
};
