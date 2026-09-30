// backend/routes/LoanRoutes.js
import express from "express";
import {
 createLoan,
 getLoans,
 getLoanById,
 updateLoan,
 returnLoan,
 deleteLoan
} from "../controllers/LoanController.js";

const router=express.Router();

router.post("/",createLoan);
router.get("/",getLoans);
router.get("/:id",getLoanById);
router.put("/:id",updateLoan);
router.put("/:id/return",returnLoan);
router.delete("/:id",deleteLoan);

export default router;
