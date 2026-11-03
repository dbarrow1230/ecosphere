import {Router} from "express";
import {list,get,create,update,remove} from "../controllers/standaloneInventoryController.js";
const router=Router();
router.get("/",list);
router.get("/:id",get);
router.post("/",create);
router.put("/:id",update);
router.delete("/:id",remove);
export default router;
