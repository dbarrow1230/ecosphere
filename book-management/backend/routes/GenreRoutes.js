// backend/routes/GenreRoutes.js
import express from "express";
import {createGenre,getGenres,getGenreById,updateGenre,deleteGenre} from "../controllers/GenreController.js";

const router=express.Router();

router.post("/",createGenre);
router.get("/",getGenres);
router.get("/:id",getGenreById);
router.put("/:id",updateGenre);
router.delete("/:id",deleteGenre);

export default router;