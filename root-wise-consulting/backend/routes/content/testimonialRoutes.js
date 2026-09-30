//backend/routes/content/testimonialRoutes.js
import express from "express";
import{
 createTestimonial,
 getTestimonials,
 getTestimonialById,
 updateTestimonial,
 deleteTestimonial,
 toggleTestimonialStatus
}from "../../controllers/content/testimonialController.js";

const router=express.Router();

router.post("/",createTestimonial);
router.get("/",getTestimonials);
router.get("/:id",getTestimonialById);
router.put("/:id",updateTestimonial);
router.patch("/:id/toggle-active",toggleTestimonialStatus);
router.delete("/:id",deleteTestimonial);

export default router;