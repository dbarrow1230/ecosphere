import express from "express";
import {
 getRelationTypes,
 getRelationTypeById,
 createRelationType,
 updateRelationType,
 archiveRelationType,
 deleteRelationType
} from "../controllers/relationTypeController.js";

const router=express.Router();

router.route("/")
 .get(getRelationTypes)
 .post(createRelationType);

router.patch("/:id/archive",archiveRelationType);

router.route("/:id")
 .get(getRelationTypeById)
 .put(updateRelationType)
 .delete(deleteRelationType);

export default router;