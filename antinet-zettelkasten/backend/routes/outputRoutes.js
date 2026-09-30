import express from "express";
import {
 getOutputs,
 getOutputById,
 openOutputDocument,
 selectOutputDocument,
 createOutput,
 updateOutput,
 archiveOutput,
 toggleFavoriteOutput,
 deleteOutput
} from "../controllers/outputController.js";

const router=express.Router();

router.route("/")
 .get(getOutputs)
 .post(createOutput);

router.post("/select-document",selectOutputDocument);

router.patch("/:id/archive",archiveOutput);
router.patch("/:id/favorite",toggleFavoriteOutput);
router.get("/:id/document",openOutputDocument);

router.route("/:id")
 .get(getOutputById)
 .put(updateOutput)
 .delete(deleteOutput);

export default router;
