import Equipment from "../../models/photography/equipmentModel.js";
import Photo from "../../models/photography/photoModel.js";
import Shoot from "../../models/photography/shootModel.js";
import {resourceController,requireUnused} from "./resourceController.js";
const controller=resourceController({Model:Equipment,fields:["name","type","brand","model","serialNumber","purchaseDate","purchasePrice","description"],beforeDelete:async record=>{
 await requireUnused(Photo,{$or:[{cameraRef:record._id},{lensRef:record._id}]});await requireUnused(Shoot,{equipmentRefs:record._id});
}});
export const {list:getEquipment,get:getEquipmentItem,create:createEquipment,update:updateEquipment,remove:deleteEquipment}=controller;
