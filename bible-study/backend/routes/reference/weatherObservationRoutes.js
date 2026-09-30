import express from "express";
import {
	createWeatherObservation,
	getWeatherObservations,
	getWeatherObservationById,
	updateWeatherObservation,
	deleteWeatherObservation
} from "../../controllers/reference/weatherObservationController.js";

const router=express.Router();

router.post("/",createWeatherObservation);
router.get("/",getWeatherObservations);
router.get("/:id",getWeatherObservationById);
router.put("/:id",updateWeatherObservation);
router.delete("/:id",deleteWeatherObservation);

export default router;