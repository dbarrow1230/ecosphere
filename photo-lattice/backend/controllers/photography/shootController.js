import Shoot from "../../models/photography/shootModel.js";
import Equipment from "../../models/photography/equipmentModel.js";
import Photo from "../../models/photography/photoModel.js";
import Reminder from "../../models/photography/reminderModel.js";
import {resourceController,requireUnused} from "./resourceController.js";
const controller=resourceController({Model:Shoot,fields:["name","description","startsAt","endsAt","location","client","status","equipmentRefs"],populate:["equipmentRefs"],references:{equipmentRefs:{model:Equipment,many:true}},validate:payload=>{
 if(payload.endsAt&&payload.startsAt&&new Date(payload.endsAt)<new Date(payload.startsAt))throw Object.assign(new Error("End time must be after start time."),{status:400});
},beforeDelete:async record=>{await requireUnused(Photo,{shootRef:record._id});await requireUnused(Reminder,{shootRef:record._id});}});
export const {list:getShoots,get:getShoot,create:createShoot,update:updateShoot,remove:deleteShoot}=controller;
