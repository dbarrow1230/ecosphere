// backend/routes/supplierRoutes.js
import express from "express";
import {createSupplier,getSuppliers,getSingleSupplier,updateSupplier,deleteSupplier} from "../controllers/supplierController.js";

const router=express.Router();

router.post("/",createSupplier);
router.get("/",getSuppliers);
router.get("/:id",getSingleSupplier);
router.put("/:id",updateSupplier);
router.delete("/:id",deleteSupplier);

export default router;