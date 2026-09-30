import express from "express";
import {
 createMentee,
 getMentees,
 getMenteeById,
 updateMentee,
 updateMenteeAgreement,
 deleteMentee
} from "../controllers/menteeController.js";

const router=express.Router();

router.get("/",getMentees);
router.get("/list",getMentees);
router.post("/",createMentee);
router.post("/create",createMentee);
router.get("/:id",getMenteeById);
router.patch("/:id/agreement",updateMenteeAgreement);
router.put("/:id",updateMentee);
router.delete("/:id",deleteMentee);

export default router;
