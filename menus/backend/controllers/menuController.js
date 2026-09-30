import Menu from "../models/menuModel.js";
import {createCrudController} from "../services/createCrudController.js";

export const {list,create,update,remove}=createCrudController(Menu);
