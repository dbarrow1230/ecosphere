// backend/routes/species/speciesRoutes.js
import express from "express";
import {
	createSpecies,
	getSpecies,
	getSpeciesById,
	updateSpecies,
	updateSpeciesVariety,
	deleteSpecies
} from "../../controllers/species/speciesController.js";

const router=express.Router();

router.route("/")
	.get(getSpecies)
	.post(createSpecies);

router.route("/:id")
	.get(getSpeciesById)
	.put(updateSpecies)
	.delete(deleteSpecies);

router.patch("/:id/variety",updateSpeciesVariety);

export default router;
