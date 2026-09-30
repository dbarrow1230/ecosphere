// backend/routes/supplies/supplyRoutes.js
import express from "express";
import {
createSupply,
getSupplies,
getSupplyById,
updateSupply,
deleteSupply
} from "../../controllers/supplies/supplyController.js";

const router=express.Router();

router.post("/",createSupply);
router.get("/",getSupplies);
router.get("/:id",getSupplyById);
router.put("/:id",updateSupply);
router.delete("/:id",deleteSupply);

export default router;