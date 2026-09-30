// backend/routes/dehydratorRoutes.js
import express from "express";
import {
 createDehydrator,
 getDehydrators,
 getDehydratorById,
 updateDehydrator,
 deleteDehydrator,
 toggleDehydratorStatus
} from "../../controllers/preservation/dehydratorController.js";

const router=express.Router();

router.get("/",getDehydrators);
router.get("/:id",getDehydratorById);
router.post("/",createDehydrator);
router.put("/:id",updateDehydrator);
router.patch("/:id/toggle-status",toggleDehydratorStatus);
router.delete("/:id",deleteDehydrator);

export default router;