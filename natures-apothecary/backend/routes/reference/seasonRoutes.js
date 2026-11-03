// backend/routes/reference/seasonRoutes.js
import express from "express";
import {createSeason,getSeasons,getSeasonById,updateSeason,deleteSeason} from "../../controllers/reference/seasonController.js";

const router=express.Router();

router.post("/",createSeason);
router.get("/",getSeasons);
router.get("/:id",getSeasonById);
router.put("/:id",updateSeason);
router.delete("/:id",deleteSeason);

export default router;