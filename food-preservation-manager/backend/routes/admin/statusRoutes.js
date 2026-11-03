import express from "express";
import {createStatus,deleteStatus,getStatusById,getStatuses,updateStatus} from "../../controllers/admin/statusController.js";

const router=express.Router();

router.get("/",getStatuses);
router.get("/:id",getStatusById);
router.post("/",createStatus);
router.put("/:id",updateStatus);
router.delete("/:id",deleteStatus);

export default router;
