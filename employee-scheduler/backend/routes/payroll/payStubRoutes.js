// backend/routes/payroll/payStubRoutes.js
import express from "express";
import {
 createPayStub,
 getPayStubs,
 getPayStubById,
 updatePayStub,
 deletePayStub
} from "../../controllers/payroll/payStubController.js";

const router=express.Router();

router.post("/",createPayStub);
router.get("/",getPayStubs);
router.get("/:id",getPayStubById);
router.put("/:id",updatePayStub);
router.delete("/:id",deletePayStub);

export default router;