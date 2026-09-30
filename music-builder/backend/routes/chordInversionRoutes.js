import express from "express";
import {protect} from "../middleware/authMiddleware.js";
import {getChordInversions} from "../controllers/chordInversionController.js";

const router=express.Router();
router.get("/",protect,getChordInversions);
export default router;
