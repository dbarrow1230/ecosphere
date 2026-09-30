// backend/routes/stateRoutes.js
import express from "express";
import{
 createState,
 getStates,
 getStateById
}from "../../controllers/location/stateController.js";

const router=express.Router();

router.post("/",createState);
router.get("/",getStates);
router.get("/:id",getStateById);

export default router;