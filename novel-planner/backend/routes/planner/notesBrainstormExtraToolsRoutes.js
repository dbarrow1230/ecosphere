// backend/routes/planner/notesBrainstormExtraToolsRoutes.js
import express from "express";
import {
 getNotesBrainstormExtraTools,
 getNotesBrainstormExtraToolsById,
 saveNotesBrainstormExtraTools,
 updateNotesBrainstormExtraTools,
 archiveNotesBrainstormExtraTools
} from "../../controllers/planner/notesBrainstormExtraToolsController.js";

const router=express.Router();

router.get("/",getNotesBrainstormExtraTools);
router.get("/:id",getNotesBrainstormExtraToolsById);
router.post("/",saveNotesBrainstormExtraTools);
router.put("/:id",updateNotesBrainstormExtraTools);
router.patch("/:id/archive",archiveNotesBrainstormExtraTools);

export default router;