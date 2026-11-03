import Tag from "../../models/photography/tagModel.js";
import Photo from "../../models/photography/photoModel.js";
import {resourceController,requireUnused} from "./resourceController.js";
const controller=resourceController({Model:Tag,fields:["name","description"],beforeDelete:record=>requireUnused(Photo,{tagRefs:record._id})});
export const {list:getTags,get:getTag,create:createTag,update:updateTag,remove:deleteTag}=controller;
