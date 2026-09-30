//backend/routes/consulting/serviceRoutes.js
import express from "express";
import{
 createService,
 getServices,
 getServiceById,
 updateService,
 deleteService,
 toggleServiceStatus
}from "../../controllers/consulting/serviceController.js";

const router=express.Router();

router.post("/",createService);
router.get("/",getServices);
router.get("/:id",getServiceById);
router.put("/:id",updateService);
router.patch("/:id/toggle-active",toggleServiceStatus);
router.delete("/:id",deleteService);

export default router;