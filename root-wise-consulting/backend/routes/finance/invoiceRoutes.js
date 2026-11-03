//backend/routes/finance/invoiceRoutes.js
import express from "express";
import {createInvoice,getInvoices,getInvoiceById,updateInvoice,deleteInvoice} from "../../controllers/finance/invoiceController.js";

const router=express.Router();

router.route("/")
 .post(createInvoice)
 .get(getInvoices);

router.route("/:id")
 .get(getInvoiceById)
 .put(updateInvoice)
 .delete(deleteInvoice);

export default router;