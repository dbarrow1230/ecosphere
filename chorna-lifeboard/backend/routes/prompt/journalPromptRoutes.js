import express from "express";
import journalPromptController from "../../controllers/prompt/journalPromptController.js";

const router=express.Router();

router.route("/")
 .get(journalPromptController.getAll)
 .post(journalPromptController.create);

router.route("/:id")
 .get(journalPromptController.getById)
 .put(journalPromptController.update)
 .delete(journalPromptController.remove);

export default router;