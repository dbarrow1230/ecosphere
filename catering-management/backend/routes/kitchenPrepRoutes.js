// backend/routes/kitchenPrepRoutes.js
import express from "express";
import {
 getKitchenPrep,
 getKitchenPrepById,
 createKitchenPrep,
 updateKitchenPrep,
 deleteKitchenPrep
} from "../controllers/kitchenPrepController.js";

const router=express.Router();

router.route("/").get(getKitchenPrep).post(createKitchenPrep);
router.route("/:id").get(getKitchenPrepById).put(updateKitchenPrep).delete(deleteKitchenPrep);

export default router;