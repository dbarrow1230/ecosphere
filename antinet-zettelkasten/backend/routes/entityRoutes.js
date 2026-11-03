import express from "express";
import {
 getEntities,
 getEntityById,
 createEntity,
 updateEntity,
 archiveEntity,
 deleteEntity
} from "../controllers/entityController.js";

const router=express.Router();

router.route("/")
 .get(getEntities)
 .post(createEntity);

router.patch("/:id/archive",archiveEntity);

router.route("/:id")
 .get(getEntityById)
 .put(updateEntity)
 .delete(deleteEntity);

export default router;