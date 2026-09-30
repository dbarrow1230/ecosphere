import MenuItem from "../models/menuItemModel.js";
import {createCrudController} from "../services/createCrudController.js";

export const {list,create,update,remove}=createCrudController(MenuItem);
