// backend/routes/invoiceRoutes.js
import express from "express";
import {createInvoice,getInvoices,getSingleInvoice,updateInvoice,deleteInvoice} from "../controllers/invoiceController.js";

const router=express.Router();

router.post("/",createInvoice);
router.get("/",getInvoices);
router.get("/:id",getSingleInvoice);
router.put("/:id",updateInvoice);
router.delete("/:id",deleteInvoice);

export default router;