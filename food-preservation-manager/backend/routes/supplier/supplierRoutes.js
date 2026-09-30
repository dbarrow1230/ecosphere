import express from "express";
import {createSupplier,deleteSupplier,getSupplierById,getSuppliers,updateSupplier} from "../../controllers/supplier/supplierController.js";

const router=express.Router();

router.get("/",getSuppliers);
router.get("/:id",getSupplierById);
router.post("/",createSupplier);
router.put("/:id",updateSupplier);
router.delete("/:id",deleteSupplier);

export default router;
