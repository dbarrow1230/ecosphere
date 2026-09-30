import express from "express";
import {
 createMeetingMethod,
 getMeetingMethods,
 getMeetingMethodById,
 updateMeetingMethod,
 deleteMeetingMethod
} from "../controllers/meetingMethodController.js";

const router=express.Router();

router.get("/",getMeetingMethods);
router.get("/list",getMeetingMethods);
router.post("/",createMeetingMethod);
router.post("/create",createMeetingMethod);
router.get("/:id",getMeetingMethodById);
router.put("/:id",updateMeetingMethod);
router.delete("/:id",deleteMeetingMethod);

export default router;