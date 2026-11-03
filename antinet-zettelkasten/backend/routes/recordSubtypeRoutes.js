import express from "express";
import {
 getRecordSubtypes,
 getRecordSubtypeById,
 createRecordSubtype,
 updateRecordSubtype,
 archiveRecordSubtype,
 deleteRecordSubtype
} from "../controllers/recordSubtypeController.js";

const router=express.Router();

router.route("/")
 .get(getRecordSubtypes)
 .post(createRecordSubtype);

router.patch("/:id/archive",archiveRecordSubtype);

router.route("/:id")
 .get(getRecordSubtypeById)
 .put(updateRecordSubtype)
 .delete(deleteRecordSubtype);

export default router;