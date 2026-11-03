import Product from "../../models/master/productModel.js";
import {createCrudController} from "../../services/createCrudController.js";
export const {list,get,create,update,remove}=createCrudController(Product);
