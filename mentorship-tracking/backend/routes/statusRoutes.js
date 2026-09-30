// backend/routes/statusRoutes.js
import express from "express";
import {
 createStatus,
 getStatuses,
 getStatusById,
 updateStatus,
 deleteStatus
} from "../controllers/statusController.js";

const router=express.Router();

router.post("/create",createStatus);
router.get("/list",getStatuses);
router.get("/:id",getStatusById);
router.put("/:id",updateStatus);
router.delete("/:id",deleteStatus);

export default router;