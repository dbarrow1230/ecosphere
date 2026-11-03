// backend/routes/PoemRoutes.js
import express from "express";
import {getPoems,getPoemById,getPoemBySlug,getPoemBySlugOrTitle,checkPoemSlug,createPoem,updatePoem,deletePoem} from "../controllers/PoemController.js";

const router=express.Router();

router.route("/")
.get(getPoems)
.post(createPoem);

router.route("/check-slug")
.get(checkPoemSlug);

router.route("/slug/:slug")
.get(getPoemBySlug);

router.route("/find/:value")
.get(getPoemBySlugOrTitle);

router.route("/:id")
.get(getPoemById)
.put(updatePoem)
.delete(deletePoem);

export default router;