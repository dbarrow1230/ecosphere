import {protect} from "../../middleware/authMiddleware.js";
import {websiteManagementAccess} from "../../../../shared/backend/websiteManagementAccess.js";
import RoleAssignment from "../../models/users/userRoleAssignmentModel.js";
// backend/routes/donnations/DonationRoutes.js
import express from "express";
import {createDonation,deleteDonation,getDonationById,getDonations,updateDonationStatus} from "../../controllers/donnations/DonationController.js";

const router=express.Router();

router.post("/",createDonation);
router.get("/",protect,websiteManagementAccess(RoleAssignment),getDonations);
router.get("/:id",protect,websiteManagementAccess(RoleAssignment),getDonationById);
router.put("/:id",protect,websiteManagementAccess(RoleAssignment),updateDonationStatus);
router.delete("/:id",protect,websiteManagementAccess(RoleAssignment),deleteDonation);

export default router;