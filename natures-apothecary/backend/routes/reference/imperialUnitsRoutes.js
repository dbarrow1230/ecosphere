// backend/routes/reference/imperialUnitsRoutes.js
import express from "express";
import {createImperialUnit,getImperialUnits,getImperialUnitById,updateImperialUnit,deleteImperialUnit} from "../../controllers/reference/imperialUnitsController.js";

const router=express.Router();

router.post("/",createImperialUnit);
router.get("/",getImperialUnits);
router.get("/:id",getImperialUnitById);
router.put("/:id",updateImperialUnit);
router.delete("/:id",deleteImperialUnit);

export default router;