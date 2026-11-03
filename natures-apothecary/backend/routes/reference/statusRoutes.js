// backend/routes/reference/statusRoutes.js
import express from "express";
import {createStatus,getStatuses,getStatusById,updateStatus,deleteStatus} from "../../controllers/reference/statusController.js";

const router=express.Router();

router.post("/",createStatus);
router.get("/",getStatuses);
router.get("/:id",getStatusById);
router.put("/:id",updateStatus);
router.delete("/:id",deleteStatus);

export default router;