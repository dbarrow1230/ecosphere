//backend/routes/finance/expenseRoutes.js
import express from "express";
import {createExpense,getExpenses,getExpenseById,updateExpense,deleteExpense} from "../../controllers/finance/expenseController.js";

const router=express.Router();

router.route("/")
 .post(createExpense)
 .get(getExpenses);

router.route("/:id")
 .get(getExpenseById)
 .put(updateExpense)
 .delete(deleteExpense);

export default router;