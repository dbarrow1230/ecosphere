import Store from "../../models/locations/storeModel.js";
import {createCrudController} from "../../services/createCrudController.js";
export const {list,get,create,update,remove}=createCrudController(Store);
