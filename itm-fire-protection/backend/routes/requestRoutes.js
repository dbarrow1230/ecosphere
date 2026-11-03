import express from "express";
import {protect} from "../middleware/authMiddleware.js";
import {requestAccess} from "../middleware/requestAccess.js";
import {createRequest,getRequests,updateRequest} from "../controllers/requestController.js";

const router=express.Router();
router.post("/",createRequest);
router.get("/",protect,requestAccess,getRequests);
router.patch("/:id",protect,requestAccess,updateRequest);
export default router;
