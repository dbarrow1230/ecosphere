// backend/routes/lookups/statusRoutes.js
import express from "express";
import {
 getStatuses,
 getStatusById,
 createStatus,
 updateStatus,
 deleteStatus
} from "../../controllers/lookups/statusController.js";

const router=express.Router();

router.get("/",getStatuses);
router.get("/:id",getStatusById);
router.post("/",createStatus);
router.put("/:id",updateStatus);
router.delete("/:id",deleteStatus);

export default router;