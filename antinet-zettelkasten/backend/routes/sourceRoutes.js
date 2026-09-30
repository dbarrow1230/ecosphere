import express from "express";
import {
 archiveSource,
 createSource,
 deleteSource,
 getSourceById,
 getSources,
 updateSource
} from "../controllers/sourceController.js";

const router=express.Router();

router.route("/")
 .get(getSources)
 .post(createSource);

router.patch("/:id/archive",archiveSource);

router.route("/:id")
 .get(getSourceById)
 .put(updateSource)
 .delete(deleteSource);

export default router;