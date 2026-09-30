import express from "express";
import promptController from "../../controllers/prompt/promptController.js";

const router=express.Router();

router.route("/")
 .get(promptController.getAll)
 .post(promptController.create);

router.route("/:id")
 .get(promptController.getById)
 .put(promptController.update)
 .delete(promptController.remove);

export default router;