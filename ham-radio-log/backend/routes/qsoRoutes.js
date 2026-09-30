import express from "express";
import {createQso,deleteQso,getQsoById,getQsos,updateQso} from "../controllers/qsoController.js";
import {protect} from "../middleware/authMiddleware.js";

const router=express.Router();

router.use(protect);

router.get("/",getQsos);
router.get("/:id",getQsoById);
router.post("/",createQso);
router.put("/:id",updateQso);
router.delete("/:id",deleteQso);

export default router;
