//backend/routes/consulting/menuReviewRoutes.js
import express from "express";
import{
 createMenuReview,
 getMenuReviews,
 getMenuReviewById,
 updateMenuReview,
 deleteMenuReview,
 toggleMenuReviewStatus
}from "../../controllers/consulting/menuReviewController.js";

const router=express.Router();

router.post("/",createMenuReview);
router.get("/",getMenuReviews);
router.get("/:id",getMenuReviewById);
router.put("/:id",updateMenuReview);
router.patch("/:id/toggle-active",toggleMenuReviewStatus);
router.delete("/:id",deleteMenuReview);

export default router;