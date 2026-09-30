//backend/routes/consulting/openingSupportRoutes.js
import express from "express";
import{
 createOpeningSupport,
 getOpeningSupports,
 getOpeningSupportById,
 updateOpeningSupport,
 deleteOpeningSupport,
 toggleOpeningSupportStatus
}from "../../controllers/consulting/openingSupportController.js";

const router=express.Router();

router.post("/",createOpeningSupport);
router.get("/",getOpeningSupports);
router.get("/:id",getOpeningSupportById);
router.put("/:id",updateOpeningSupport);
router.patch("/:id/toggle-active",toggleOpeningSupportStatus);
router.delete("/:id",deleteOpeningSupport);

export default router;