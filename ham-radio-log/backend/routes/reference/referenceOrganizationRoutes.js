import express from "express";
import {
 getReferenceOrganizations,
 getReferenceOrganization,
 createReferenceOrganization,
 updateReferenceOrganization,
 deleteReferenceOrganization
} from "../../controllers/reference/referenceOrganizationController.js";

const router=express.Router();

router.get("/",getReferenceOrganizations);
router.get("/:id",getReferenceOrganization);
router.post("/",createReferenceOrganization);
router.put("/:id",updateReferenceOrganization);
router.delete("/:id",deleteReferenceOrganization);

export default router;