// backend/routes/serviceRoutes.js
import express from "express";
import {createService,getServices,getSingleService,updateService,deleteService} from "../controllers/serviceController.js";

const router=express.Router();

router.post("/",createService);
router.get("/",getServices);
router.get("/:id",getSingleService);
router.put("/:id",updateService);
router.delete("/:id",deleteService);

export default router;