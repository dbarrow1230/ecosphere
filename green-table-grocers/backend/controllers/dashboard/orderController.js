import Order from "../../models/dashboard/orderModel.js";
import {createCrudController} from "../../services/createCrudController.js";
export const {list,get,create,update,remove}=createCrudController(Order);
