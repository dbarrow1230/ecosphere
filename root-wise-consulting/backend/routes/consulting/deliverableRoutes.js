//backend/routes/consulting/deliverableRoutes.js
import express from "express";
import{
 createDeliverable,
 getDeliverables,
 getDeliverableById,
 updateDeliverable,
 deleteDeliverable,
 toggleDeliverableStatus
}from "../../controllers/consulting/deliverableController.js";

const router=express.Router();

router.post("/",createDeliverable);
router.get("/",getDeliverables);
router.get("/:id",getDeliverableById);
router.put("/:id",updateDeliverable);
router.patch("/:id/toggle-active",toggleDeliverableStatus);
router.delete("/:id",deleteDeliverable);

export default router;