// backend/routes/reference/footerRoutes.js
import express from "express";
import {createFooter,getFooters,getFooterById,updateFooter,deleteFooter} from "../../controllers/reference/footerController.js";

const router=express.Router();

router.post("/",createFooter);
router.get("/",getFooters);
router.get("/:id",getFooterById);
router.put("/:id",updateFooter);
router.delete("/:id",deleteFooter);

export default router;