// backend/routes/employees/attachmentRoutes.js
import express from "express";
import {createAttachment,deleteAttachment,getAttachments} from "../../controllers/employees/attachmentController.js";

const router=express.Router();

router.post("/",createAttachment);
router.get("/",getAttachments);
router.delete("/:id",deleteAttachment);

export default router;
