import express from "express";
import {getLocations,getLocationById,createLocation,updateLocation,deleteLocation} from "../controllers/locationHoursController.js";

const router=express.Router();

router.route("/").get(getLocations).post(createLocation);
router.route("/:id").get(getLocationById).put(updateLocation).delete(deleteLocation);

export default router;