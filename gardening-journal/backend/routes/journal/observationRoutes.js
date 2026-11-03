// backend/routes/journal/observationRoutes.js
import express from "express";
import {
createObservation,
getObservations,
getObservationById,
updateObservation,
addObservationNote,
deleteObservation
} from "../../controllers/journal/observationController.js";

const router=express.Router();

router.post("/",createObservation);
router.get("/",getObservations);
router.get("/:id",getObservationById);
router.put("/:id",updateObservation);
router.patch("/:id/notes",addObservationNote);
router.delete("/:id",deleteObservation);

export default router;