import express from "express";
import {
 getTags,
 getTagById,
 createTag,
 updateTag,
 archiveTag,
 deleteTag
} from "../controllers/tagController.js";

const router=express.Router();

router.route("/")
 .get(getTags)
 .post(createTag);

router.patch("/:id/archive",archiveTag);

router.route("/:id")
 .get(getTagById)
 .put(updateTag)
 .delete(deleteTag);

export default router;