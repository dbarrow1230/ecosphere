import {protect} from "../../middleware/authMiddleware.js";
import {websiteManagementAccess} from "../../../../shared/backend/websiteManagementAccess.js";
import RoleAssignment from "../../models/users/userRoleAssignmentModel.js";
// backend/routes/donnations/DonorContactRoutes.js
import express from "express";
import {
 createDonorContact,
 deleteDonorContact,
 getDonorContactById,
 getDonorContacts,
 updateDonorContact
} from "../../controllers/donnations/DonorContactController.js";

const router=express.Router();

router.post("/",protect,websiteManagementAccess(RoleAssignment),createDonorContact);
router.get("/",protect,websiteManagementAccess(RoleAssignment),getDonorContacts);
router.get("/:id",protect,websiteManagementAccess(RoleAssignment),getDonorContactById);
router.put("/:id",protect,websiteManagementAccess(RoleAssignment),updateDonorContact);
router.delete("/:id",protect,websiteManagementAccess(RoleAssignment),deleteDonorContact);

export default router;