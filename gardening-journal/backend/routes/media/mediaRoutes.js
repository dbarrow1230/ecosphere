// backend/routes/media/mediaRoutes.js
import express from "express";
import {
createMedia,
getMedia,
getMediaById,
updateMedia,
deleteMedia
} from "../../controllers/media/mediaController.js";

const router=express.Router();

router.post("/",createMedia);
router.get("/",getMedia);
router.get("/:id",getMediaById);
router.put("/:id",updateMedia);
router.delete("/:id",deleteMedia);

export default router;