//backend/routes/waste/wasteRecordRoutes.js
import express from "express";
import {createWasteRecord,getWasteRecords,getWasteRecordById,updateWasteRecord,deleteWasteRecord} from "../../controllers/waste/wasteRecordController.js";

const router=express.Router();

router.post("/",createWasteRecord);
router.get("/",getWasteRecords);
router.get("/:id",getWasteRecordById);
router.put("/:id",updateWasteRecord);
router.delete("/:id",deleteWasteRecord);

export default router;