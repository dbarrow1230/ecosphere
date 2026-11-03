import Event from "../../models/orders/eventModel.js";

const normalizeStatus=value=>{
 const status=String(value||"").trim();
 if(["Confirmed","Prep","Completed","Cancelled"].includes(status))return status;
 return "Pending";
};

const normalizeEventPayload=body=>({
 eventName:String(body?.eventName||"").trim(),
 clientName:String(body?.clientName||"").trim(),
 client:body?.client||null,
 eventDate:body?.eventDate||null,
 eventTime:String(body?.eventTime||"").trim(),
 guestCount:Number(body?.guestCount||0),
 status:normalizeStatus(body?.status),
 location:String(body?.location||"").trim(),
 notes:Array.isArray(body?.notes)
  ?body.notes.map(note=>String(note||"").trim()).filter(Boolean)
  :String(body?.notes||"").split("\n").map(note=>note.trim()).filter(Boolean)
});

export const getEvents=async(req,res)=>{
 try{
  const query={};
  if(req.query.status)query.status=normalizeStatus(req.query.status);
  if(req.query.client)query.client=req.query.client;

  const events=await Event.find(query).populate("client").sort({eventDate:1,createdAt:-1});

  return res.status(200).json({success:true,count:events.length,data:events,events});
 }catch(error){
  return res.status(500).json({success:false,message:error.message||"Failed to fetch events"});
 }
};

export const getEventById=async(req,res)=>{
 try{
  const event=await Event.findById(req.params.id).populate("client");

  if(!event)return res.status(404).json({success:false,message:"Event not found"});

  return res.status(200).json({success:true,data:event,event});
 }catch(error){
  return res.status(500).json({success:false,message:error.message||"Failed to fetch event"});
 }
};

export const createEvent=async(req,res)=>{
 try{
  const event=await Event.create(normalizeEventPayload(req.body));
  const populated=await Event.findById(event._id).populate("client");

  return res.status(201).json({success:true,message:"Event created",data:populated,event:populated});
 }catch(error){
  return res.status(400).json({success:false,message:error.message||"Failed to create event"});
 }
};

export const updateEvent=async(req,res)=>{
 try{
  const event=await Event.findByIdAndUpdate(
   req.params.id,
   normalizeEventPayload(req.body),
   {returnDocument:"after",runValidators:true}
  ).populate("client");

  if(!event)return res.status(404).json({success:false,message:"Event not found"});

  return res.status(200).json({success:true,message:"Event updated",data:event,event});
 }catch(error){
  return res.status(400).json({success:false,message:error.message||"Failed to update event"});
 }
};

export const deleteEvent=async(req,res)=>{
 try{
  const event=await Event.findByIdAndDelete(req.params.id);

  if(!event)return res.status(404).json({success:false,message:"Event not found"});

  return res.status(200).json({success:true,message:"Event deleted"});
 }catch(error){
  return res.status(500).json({success:false,message:error.message||"Failed to delete event"});
 }
};
