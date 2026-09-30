import Model from "../models/standaloneMenuModel.js";
import {resourceController} from "../../../shared/backend/resourceController.js";
export const {list,get,create,update,remove}=resourceController(Model,{singular:"menu",plural:"menus"});
