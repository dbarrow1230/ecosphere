import Inventory from "../../models/dashboard/inventoryModel.js";
import {createCrudController} from "../../services/createCrudController.js";
export const {list,get,create,update,remove}=createCrudController(Inventory);
