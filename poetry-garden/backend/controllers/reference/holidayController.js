// backend/controllers/reference/holidayController.js
import Holiday from "../../models/reference/holidayModel.js";
import Business from "../../models/reference/businessModel.js";
import Season from "../../models/reference/seasonModel.js";

const populateHoliday=query=>query
 .populate({path:"business_id",model:Business})
 .populate({path:"seasonRef",model:Season});

const normalizeHolidayPayload=payload=>({
 ...payload,
 business_id:payload.business_id||null,
 seasonRef:payload.seasonRef||null,
 code:payload.code||undefined
});

export const createHoliday=async(req,res,next)=>{
 try{
  const holiday=await Holiday.create(normalizeHolidayPayload(req.body));
  const populatedHoliday=await populateHoliday(
   Holiday.findById(holiday._id)
  );
  res.status(201).json(populatedHoliday);
 }catch(error){
  next(error);
 }
};

export const getHolidays=async(req,res,next)=>{
 try{
  const filter={};

  if(req.query.business_id)filter.business_id=req.query.business_id;
  if(req.query.seasonRef)filter.seasonRef=req.query.seasonRef;
  if(req.query.isActive!==undefined)filter.isActive=req.query.isActive==="true";

  const holidays=await populateHoliday(
   Holiday.find(filter).sort({startDate:1,createdAt:-1})
  );

  res.status(200).json(holidays);
 }catch(error){
  next(error);
 }
};

export const getHolidayById=async(req,res,next)=>{
 try{
  const holiday=await populateHoliday(
   Holiday.findById(req.params.id)
  );

  if(!holiday)return res.status(404).json({message:"Holiday not found"});

  res.status(200).json(holiday);
 }catch(error){
  next(error);
 }
};

export const updateHoliday=async(req,res,next)=>{
 try{
  const updated=await Holiday.findByIdAndUpdate(
   req.params.id,
   normalizeHolidayPayload(req.body),
   {returnDocument:"after",runValidators:true}
  );

  if(!updated)return res.status(404).json({message:"Holiday not found"});

  const populatedHoliday=await populateHoliday(
   Holiday.findById(updated._id)
  );

  res.status(200).json(populatedHoliday);
 }catch(error){
  next(error);
 }
};

export const deleteHoliday=async(req,res,next)=>{
 try{
  const holiday=await Holiday.findByIdAndDelete(req.params.id);

  if(!holiday)return res.status(404).json({message:"Holiday not found"});

  res.status(200).json({message:"Holiday deleted successfully"});
 }catch(error){
  next(error);
 }
};
