// backend/routes/AcquisitionMethodRoutes.js
import express from "express";
import {
 createAcquisitionMethod,
 getAcquisitionMethods,
 getAcquisitionMethodById,
 updateAcquisitionMethod,
 deleteAcquisitionMethod
} from "../controllers/AcquisitionMethodController.js";

const router=express.Router();

router.route("/")
 .get(getAcquisitionMethods)
 .post(createAcquisitionMethod);

router.route("/:id")
 .get(getAcquisitionMethodById)
 .put(updateAcquisitionMethod)
 .delete(deleteAcquisitionMethod);

export default router;