// backend/routes/AcquisitionSourceRoutes.js
import express from "express";
import {
 createAcquisitionSource,
 getAcquisitionSources,
 getAcquisitionSourceById,
 updateAcquisitionSource,
 deleteAcquisitionSource
} from "../controllers/AcquisitionSourceController.js";

const router=express.Router();

router.route("/")
 .get(getAcquisitionSources)
 .post(createAcquisitionSource);

router.route("/:id")
 .get(getAcquisitionSourceById)
 .put(updateAcquisitionSource)
 .delete(deleteAcquisitionSource);

export default router;