import express from "express";
import {
	createSeedCollection,
	getSeedCollections,
	getSeedCollectionById,
	updateSeedCollection,
	deleteSeedCollection
} from "../../controllers/seeds/seedCollectionController.js";

const router=express.Router();

router.post("/",createSeedCollection);
router.get("/",getSeedCollections);
router.get("/user/:userId",getSeedCollections);
router.get("/:id",getSeedCollectionById);
router.put("/:id",updateSeedCollection);
router.patch("/:id",updateSeedCollection);
router.delete("/:id",deleteSeedCollection);

export default router;
