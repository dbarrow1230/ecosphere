// backend/routes/favoriteRoutes.js
import express from "express";
import{
 createFavorite,
 getFavorites,
 getFavoriteById,
 deleteFavorite
}from "../controllers/favoriteController.js";

const router=express.Router();

router.post("/",createFavorite);
router.get("/",getFavorites);
router.get("/:id",getFavoriteById);
router.delete("/:id",deleteFavorite);

export default router;