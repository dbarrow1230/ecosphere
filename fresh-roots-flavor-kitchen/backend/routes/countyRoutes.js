// backend/routes/countyRoutes.js
import express from "express";
import{
 createCounty,
 getCounties,
 getCountyById,
 updateCounty,
 deleteCounty
}from "../controllers/countyController.js";

const router=express.Router();

router.post("/",createCounty);
router.get("/",getCounties);
router.get("/:id",getCountyById);
router.put("/:id",updateCounty);
router.delete("/:id",deleteCounty);

export default router;