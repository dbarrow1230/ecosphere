// backend/routes/payroll/w2Routes.js
import express from "express";
import {
 createW2,
 getW2s,
 getW2ById,
 updateW2,
 deleteW2
} from "../../controllers/payroll/w2Controller.js";

const router=express.Router();

router.post("/",createW2);
router.get("/",getW2s);
router.get("/:id",getW2ById);
router.put("/:id",updateW2);
router.delete("/:id",deleteW2);

export default router;