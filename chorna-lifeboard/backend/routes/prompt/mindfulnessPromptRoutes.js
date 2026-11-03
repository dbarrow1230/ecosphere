import express from "express";
import mindfulnessPromptController from "../../controllers/prompt/mindfulnessPromptController.js";

const router=express.Router();

router.route("/")
 .get(mindfulnessPromptController.getAll)
 .post(mindfulnessPromptController.create);

router.route("/:id")
 .get(mindfulnessPromptController.getById)
 .put(mindfulnessPromptController.update)
 .delete(mindfulnessPromptController.remove);

export default router;