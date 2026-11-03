// backend/routes/resources/resourceRoutes.js
import express from "express";
import {
 createResource,
 getResources,
 getResourcesByMentee,
 getGivenResources,
 giveResource,
 updateGivenResource,
 deleteGivenResource,
 getResourceById,
 updateResource,
 deleteResource
} from "../../controllers/resources/resourceController.js";

const router=express.Router();

router.post("/",createResource);
router.get("/",getResources);
router.get("/given",getGivenResources);
router.get("/mentee/:menteeId",getResourcesByMentee);
router.post("/give",giveResource);
router.put("/given/:id",updateGivenResource);
router.delete("/given/:id",deleteGivenResource);
router.get("/:id",getResourceById);
router.put("/:id",updateResource);
router.delete("/:id",deleteResource);

export default router;
