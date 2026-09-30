import express from "express";
import {
 getRevisions,
 getRevisionById,
 createRevision,
 updateRevision,
 deleteRevision
} from "../controllers/revisionController.js";

const router=express.Router();

router.route("/")
 .get(getRevisions)
 .post(createRevision);

router.route("/:id")
 .get(getRevisionById)
 .put(updateRevision)
 .delete(deleteRevision);

export default router;