// backend/routes/journal/activityRoutes.js
import express from "express";
import {
createActivity,
getActivities,
getActivityById,
updateActivity,
addActivityNote,
deleteActivity
} from "../../controllers/journal/activityController.js";

const router=express.Router();

router.post("/",createActivity);
router.get("/",getActivities);
router.get("/:id",getActivityById);
router.put("/:id",updateActivity);
router.patch("/:id/notes",addActivityNote);
router.delete("/:id",deleteActivity);

export default router;