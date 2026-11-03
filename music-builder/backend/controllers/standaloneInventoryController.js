import Model from "../models/standaloneInventoryModel.js";
import {resourceController} from "../../../shared/backend/resourceController.js";
export const {list,get,create,update,remove}=resourceController(Model,{singular:"item",plural:"items"});
