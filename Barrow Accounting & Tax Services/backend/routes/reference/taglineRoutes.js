// backend/routes/reference/taglineRoutes.js
import express from "express";
import {createTagline,getTaglines,getTaglineById,updateTagline,deleteTagline} from "../../controllers/reference/taglineController.js";

const router=express.Router();

router.post("/",createTagline);
router.get("/",getTaglines);
router.get("/:id",getTaglineById);
router.put("/:id",updateTagline);
router.delete("/:id",deleteTagline);

export default router;