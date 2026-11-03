import express from "express";
import {createContactInquiry,getContactInquiries} from "../../controllers/contact/contactInquiryController.js";

const router=express.Router();
router.get("/",getContactInquiries);
router.post("/",createContactInquiry);
export default router;
