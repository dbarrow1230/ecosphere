// backend/routes/PublisherRoutes.js
import express from "express";
import {createPublisher,getPublishers,getPublisherById,updatePublisher,deletePublisher} from "../controllers/PublisherController.js";

const router=express.Router();

router.post("/",createPublisher);
router.get("/",getPublishers);
router.get("/:id",getPublisherById);
router.put("/:id",updatePublisher);
router.delete("/:id",deletePublisher);

export default router;