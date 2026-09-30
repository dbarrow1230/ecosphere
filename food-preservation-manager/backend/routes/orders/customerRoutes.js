import express from "express";
import {createCustomer,deleteCustomer,getCustomerById,getCustomers,updateCustomer} from "../../controllers/orders/customerController.js";

const router=express.Router();

router.get("/",getCustomers);
router.get("/:id",getCustomerById);
router.post("/",createCustomer);
router.put("/:id",updateCustomer);
router.delete("/:id",deleteCustomer);

export default router;
