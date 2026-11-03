// backend/routes/fuelAccountRoutes.js
import express from "express";
import {
 getFuelAccounts,
 getFuelAccountById,
 createFuelAccount,
 updateFuelAccount,
 deleteFuelAccount
} from "../../controllers/finance/fuelAccountController.js";

const router=express.Router();

router.route("/")
.get(getFuelAccounts)
.post(createFuelAccount);

router.route("/:id")
.get(getFuelAccountById)
.put(updateFuelAccount)
.delete(deleteFuelAccount);

export default router;