import MenuCategory from "../models/menuCategoryModel.js";
import {createCrudController} from "../services/createCrudController.js";

export const {list,create,update,remove}=createCrudController(MenuCategory);
