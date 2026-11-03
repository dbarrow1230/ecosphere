// backend/routes/lookups/sessionStatusRoutes.js
import express from "express";
import {
 getSessionStatuses,
 getSessionStatusById,
 createSessionStatus,
 updateSessionStatus,
 deleteSessionStatus
} from "../../controllers/lookups/sessionStatusController.js";

const router=express.Router();

router.get("/",getSessionStatuses);
router.get("/:id",getSessionStatusById);
router.post("/",createSessionStatus);
router.put("/:id",updateSessionStatus);
router.delete("/:id",deleteSessionStatus);

export default router;