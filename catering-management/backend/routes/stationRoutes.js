// backend/routes/stationRoutes.js
import express from "express";
import {
 getStations,
 getStationById,
 createStation,
 updateStation,
 deleteStation
} from "../controllers/stationController.js";

const router=express.Router();

router.route("/").get(getStations).post(createStation);
router.route("/:id").get(getStationById).put(updateStation).delete(deleteStation);

export default router;