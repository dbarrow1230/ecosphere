import express from "express";
import {
 getZettels,
 getZettelById,
 saveQuestionAnswer,
 deleteQuestionAnswer,
 createZettel,
 updateZettel,
 archiveZettel,
 toggleFavoriteZettel,
 deleteZettel
} from "../controllers/zettelController.js";

const router=express.Router();

router.route("/")
 .get(getZettels)
 .post(createZettel);

router.patch("/:id/archive",archiveZettel);
router.patch("/:id/favorite",toggleFavoriteZettel);
router.put("/:id/questions/answer",saveQuestionAnswer);
router.delete("/:id/questions/answer",deleteQuestionAnswer);

router.route("/:id")
 .get(getZettelById)
 .put(updateZettel)
 .delete(deleteZettel);

export default router;
