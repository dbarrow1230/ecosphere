//backend/routes/core/contactInquiryRoutes.js
import express from "express";
import {
 createContactInquiry,
 getContactInquiries,
 getContactInquiryById,
 updateContactInquiry,
 deleteContactInquiry,
 deactivateContactInquiry
} from "../../controllers/core/contactInquiryController.js";

const router=express.Router();

router.route("/")
 .post(createContactInquiry)
 .get(getContactInquiries);

router.route("/:id")
 .get(getContactInquiryById)
 .put(updateContactInquiry)
 .delete(deleteContactInquiry);

router.route("/:id/deactivate")
 .patch(deactivateContactInquiry);

export default router;