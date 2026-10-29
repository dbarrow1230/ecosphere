// backend/routes/reference/LocationTypeRoutes.js
import express from "express";
import {createLocationType,getLocationTypes,getLocationTypeById,updateLocationType,deleteLocationType} from "../../controllers/reference/LocationTypeController.js";

const router=express.Router();

router.post("/",createLocationType);
router.get("/",getLocationTypes);
router.get("/:id",getLocationTypeById);
router.put("/:id",updateLocationType);
router.delete("/:id",deleteLocationType);

export default router;