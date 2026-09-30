// backend/routes/venueRoutes.js
import express from "express";
import {createVenue,getVenues,getSingleVenue,updateVenue,deleteVenue} from "../controllers/venueController.js";

const router=express.Router();

router.post("/",createVenue);
router.get("/",getVenues);
router.get("/:id",getSingleVenue);
router.put("/:id",updateVenue);
router.delete("/:id",deleteVenue);

export default router;