import Album from "../../models/photography/albumModel.js";
import Photo from "../../models/photography/photoModel.js";
import {resourceController,requireUnused} from "./resourceController.js";
const controller=resourceController({Model:Album,fields:["name","description","location","date"],beforeDelete:record=>requireUnused(Photo,{albumRefs:record._id})});
export const {list:getAlbums,get:getAlbum,create:createAlbum,update:updateAlbum,remove:deleteAlbum}=controller;
