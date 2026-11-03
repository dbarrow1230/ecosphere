import {Router} from "express";
import {requireBusinessAuth} from "../middleware/requireBusinessAuth.js";
import {getInquiries} from "../controllers/inquiryController.js";

const router=Router();
router.use(requireBusinessAuth);
router.get("/inquiries",getInquiries);
export default router;
