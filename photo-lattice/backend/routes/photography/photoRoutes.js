import express from "express";
import {protect} from "../../middleware/authMiddleware.js";
import {getPhotos,getPhoto,createPhoto,updatePhoto,deletePhoto} from "../../controllers/photography/photoController.js";
const router=express.Router();
router.use(protect);
router.route("/").get(getPhotos).post(createPhoto);
router.route("/:id").get(getPhoto).put(updatePhoto).delete(deletePhoto);
export default router;
