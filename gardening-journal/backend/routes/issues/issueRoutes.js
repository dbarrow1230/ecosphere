import express from "express";
import {createIssue,getIssues,getIssueById,updateIssue,deleteIssue} from "../../controllers/issues/issueController.js";

const router=express.Router();

router.post("/",createIssue);
router.get("/",getIssues);
router.get("/:id",getIssueById);
router.put("/:id",updateIssue);
router.delete("/:id",deleteIssue);

export default router;