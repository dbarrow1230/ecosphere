import express from "express";
import {
 createHomeLocation,
 getHomeLocations,
 getHomeLocationById,
 updateHomeLocation,
 deleteHomeLocation
} from "../../controllers/home/homeLocationController.js";

const router=express.Router();

router.post("/",createHomeLocation);
router.get("/",getHomeLocations);
router.get("/:id",getHomeLocationById);
router.put("/:id",updateHomeLocation);
router.delete("/:id",deleteHomeLocation);

export default router;
