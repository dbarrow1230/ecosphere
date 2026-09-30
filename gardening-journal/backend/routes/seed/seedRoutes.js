// backend/routes/seeds/seedRoutes.js
import express from "express";
import {createSeed,getSeeds,getSeedById,updateSeed,deleteSeed} from "../../controllers/seeds/seedController.js";

const router=express.Router();

router.post("/",createSeed);
router.get("/",getSeeds);
router.get("/user/:userId",getSeeds);
router.get("/:id",getSeedById);
router.put("/:id",updateSeed);
router.patch("/:id",updateSeed);
router.delete("/:id",deleteSeed);

export default router;