import express from "express";
import {protect} from "../middleware/authMiddleware.js";
import {requestAccess} from "../middleware/requestAccess.js";
import {listServices,getService,saveService} from "../controllers/serviceRecordController.js";
const router=express.Router();router.use(protect,requestAccess);
router.get("/",listServices);router.post("/",saveService);router.get("/:id",getService);router.put("/:id",saveService);
export default router;
