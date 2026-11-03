import Photo from "../../models/photography/photoModel.js";
import Album from "../../models/photography/albumModel.js";
import Shoot from "../../models/photography/shootModel.js";
import Equipment from "../../models/photography/equipmentModel.js";
import Tag from "../../models/photography/tagModel.js";
import Reminder from "../../models/photography/reminderModel.js";
import {fail} from "./resourceController.js";

export const getPhotographyDashboard=async(req,res)=>{
 try{
  const owner=req.user._id;
  const [photos,albums,shoots,equipment,favorites,archived,recent,upcoming,reminders]=await Promise.all([
   Photo.countDocuments({owner,status:"active"}),Album.countDocuments({owner}),Shoot.countDocuments({owner}),Equipment.countDocuments({owner}),
   Photo.countDocuments({owner,status:"active",favorite:true}),Photo.countDocuments({owner,status:"archived"}),
   Photo.find({owner,status:"active"}).sort({createdAt:-1}).limit(6),
   Shoot.find({owner,status:"planned",startsAt:{$gte:new Date()}}).sort({startsAt:1}).limit(5),
   Reminder.find({owner,completed:false}).sort({dueAt:1}).limit(10)
  ]);
  res.json({data:{counts:{photos,albums,shoots,equipment,favorites,archived},recent,upcoming,reminders}});
 }catch(error){fail(res,error);}
};

export const exportPhotography=async(req,res)=>{
 try{
  const models={photos:Photo,albums:Album,shoots:Shoot,equipment:Equipment,tags:Tag,reminders:Reminder};
  const entries=await Promise.all(Object.entries(models).map(async([key,Model])=>[key,await Model.find({owner:req.user._id}).lean()]));
  res.setHeader("Content-Disposition",'attachment; filename="photo-lattice-records.json"');
  res.json({application:"photo-lattice",version:1,exportedAt:new Date().toISOString(),includesImageFiles:false,data:Object.fromEntries(entries)});
 }catch(error){fail(res,error);}
};
