import Photo from "../../models/photography/photoModel.js";
import Album from "../../models/photography/albumModel.js";
import Shoot from "../../models/photography/shootModel.js";
import Equipment from "../../models/photography/equipmentModel.js";
import Tag from "../../models/photography/tagModel.js";
import {resourceController,isId} from "./resourceController.js";

const controller=resourceController({
 Model:Photo,
 fields:["title","fileUrl","description","takenAt","location","albumRefs","tagRefs","shootRef","cameraRef","lensRef","aperture","shutterSpeed","iso","focalLength","rating","favorite","status"],
 populate:["albumRefs","tagRefs","shootRef","cameraRef","lensRef"],
 references:{albumRefs:{model:Album,many:true},tagRefs:{model:Tag,many:true},shootRef:{model:Shoot},cameraRef:{model:Equipment,where:{type:"camera"}},lensRef:{model:Equipment,where:{type:"lens"}}},
 filter:req=>{
  const query={status:req.query.status==="archived"?"archived":"active"};
  if(req.query.favorite==="true")query.favorite=true;
  for(const field of ["albumRefs","tagRefs","shootRef"]){
   if(req.query[field]){
    if(!isId(req.query[field]))throw Object.assign(new Error("Invalid filter selection."),{status:400});
    query[field]=req.query[field];
   }
  }
  if(req.query.search){query.title={$regex:String(req.query.search).slice(0,200).replace(/[.*+?^${}()|[\]\\]/g,"\\$&"),$options:"i"};}
  return query;
 },
 validate:payload=>{
  if(payload.fileUrl&&!/^(https?:\/\/[^\s]+|\/(?!\/)[^\s]+)$/i.test(payload.fileUrl))throw Object.assign(new Error("Use an uploaded image path or an http(s) image URL."),{status:400});
 }
});
export const {list:getPhotos,get:getPhoto,create:createPhoto,update:updatePhoto,remove:deletePhoto}=controller;
