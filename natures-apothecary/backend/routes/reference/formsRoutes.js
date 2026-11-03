// backend/routes/reference/formsRoutes.js
import express from "express";
import {createForm,getForms,getFormById,updateForm,deleteForm} from "../../controllers/reference/formsController.js";

const router=express.Router();

router.post("/",createForm);
router.get("/",getForms);
router.get("/:id",getFormById);
router.put("/:id",updateForm);
router.delete("/:id",deleteForm);

export default router;