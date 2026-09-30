import express from "express";
import {protect} from "../middleware/authMiddleware.js";
import {getMusicInstruments} from "../controllers/musicInstrumentController.js";

const router=express.Router();
router.get("/",protect,getMusicInstruments);
export default router;
