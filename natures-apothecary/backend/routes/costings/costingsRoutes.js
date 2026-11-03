// backend/routes/costings/costingsRoutes.js
import express from "express";
import {createCosting,getCostings,getCostingById,updateCosting,deleteCosting} from "../../controllers/costings/costingsController.js";

const router=express.Router();

router.post("/",createCosting);
router.get("/",getCostings);
router.get("/:id",getCostingById);
router.put("/:id",updateCosting);
router.delete("/:id",deleteCosting);

export default router;