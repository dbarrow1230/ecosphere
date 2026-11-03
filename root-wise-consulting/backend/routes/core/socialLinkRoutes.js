//backend/routes/core/socialLinkRoutes.js
import express from "express";
import {
 createSocialLink,
 getSocialLinks,
 getSocialLinkById,
 updateSocialLink,
 deleteSocialLink,
 deactivateSocialLink
} from "../../controllers/core/socialLinkController.js";

const router=express.Router();

router.route("/")
 .post(createSocialLink)
 .get(getSocialLinks);

router.route("/:id")
 .get(getSocialLinkById)
 .put(updateSocialLink)
 .delete(deleteSocialLink);

router.route("/:id/deactivate")
 .patch(deactivateSocialLink);

export default router;