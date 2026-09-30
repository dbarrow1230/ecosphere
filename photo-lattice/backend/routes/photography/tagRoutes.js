import express from "express";
import {protect} from "../../middleware/authMiddleware.js";
import {getTags,getTag,createTag,updateTag,deleteTag} from "../../controllers/photography/tagController.js";
const router=express.Router();
router.use(protect);
router.route("/").get(getTags).post(createTag);
router.route("/:id").get(getTag).put(updateTag).delete(deleteTag);
export default router;
