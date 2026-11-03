import express from "express";
import {protect} from "../../middleware/authMiddleware.js";
import {getAlbums,getAlbum,createAlbum,updateAlbum,deleteAlbum} from "../../controllers/photography/albumController.js";
const router=express.Router();
router.use(protect);
router.route("/").get(getAlbums).post(createAlbum);
router.route("/:id").get(getAlbum).put(updateAlbum).delete(deleteAlbum);
export default router;
