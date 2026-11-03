// backend/routes/reference/communityResourceRoutes.js
import express from "express";
import {
createCommunityResource,
getCommunityResources,
getCommunityResourceById,
updateCommunityResource,
deleteCommunityResource
} from "../../controllers/reference/communityResourceController.js";

const router=express.Router();

router.post("/",createCommunityResource);
router.get("/",getCommunityResources);
router.get("/:id",getCommunityResourceById);
router.put("/:id",updateCommunityResource);
router.delete("/:id",deleteCommunityResource);

export default router;