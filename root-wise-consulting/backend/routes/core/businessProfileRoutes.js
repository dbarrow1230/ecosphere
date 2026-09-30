//backend/routes/core/businessProfileRoutes.js
import express from "express";
import {
 createBusinessProfile,
 getBusinessProfiles,
 getBusinessProfileById,
 getBusinessProfileByClientBusiness,
 updateBusinessProfile,
 deleteBusinessProfile,
 deactivateBusinessProfile
} from "../../controllers/core/businessProfileController.js";

const router=express.Router();

router.route("/")
 .post(createBusinessProfile)
 .get(getBusinessProfiles);

router.route("/client-business/:clientBusinessId")
 .get(getBusinessProfileByClientBusiness);

router.route("/:id")
 .get(getBusinessProfileById)
 .put(updateBusinessProfile)
 .delete(deleteBusinessProfile);

router.route("/:id/deactivate")
 .patch(deactivateBusinessProfile);

export default router;