import {Router} from "express";
import rateLimit from "express-rate-limit";
import {createInquiry} from "../controllers/inquiryController.js";

const router=Router();
const limit=rateLimit({windowMs:15*60*1000,limit:5,standardHeaders:"draft-8",legacyHeaders:false});
router.post("/inquiries",limit,createInquiry);
export default router;
