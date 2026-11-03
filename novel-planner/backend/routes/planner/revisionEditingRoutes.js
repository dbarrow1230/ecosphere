// backend/routes/planner/revisionEditingRoutes.js
import express from "express";
import {
 getRevisionEditing,
 getRevisionEditingById,
 saveRevisionEditing,
 updateRevisionEditing,
 archiveRevisionEditing
} from "../../controllers/planner/revisionEditingController.js";

const router=express.Router();

router.get("/",getRevisionEditing);
router.get("/:id",getRevisionEditingById);
router.post("/",saveRevisionEditing);
router.put("/:id",updateRevisionEditing);
router.patch("/:id/archive",archiveRevisionEditing);

export default router;