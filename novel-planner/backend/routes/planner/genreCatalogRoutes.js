import express from "express";
import {listGenres,createGenre,updateGenre,archiveGenre} from "../../controllers/planner/genreCatalogController.js";
const router=express.Router();
router.get("/",listGenres);router.post("/",createGenre);router.put("/:id",updateGenre);router.patch("/:id/archive",archiveGenre);
export default router;
