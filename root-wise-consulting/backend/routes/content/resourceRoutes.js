//backend/routes/content/resourceRoutes.js
import express from "express";
import{
 createResource,
 getResources,
 getResourceById,
 updateResource,
 deleteResource,
 toggleResourceStatus
}from "../../controllers/content/resourceController.js";

const router=express.Router();

router.post("/",createResource);
router.get("/",getResources);
router.get("/:id",getResourceById);
router.put("/:id",updateResource);
router.patch("/:id/toggle-active",toggleResourceStatus);
router.delete("/:id",deleteResource);

export default router;