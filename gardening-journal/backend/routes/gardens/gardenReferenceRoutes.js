import express from "express";
import {getGardenReferences} from "../../controllers/gardens/gardenReferenceController.js";

const router=express.Router();
router.get("/",getGardenReferences);
export default router;
