// backend/routes/studies/libraryItemRoutes.js
import express from "express";
import {
 getLibraryItems,
 getLibraryItemById,
 createLibraryItem,
 updateLibraryItem,
 deleteLibraryItem
} from "../../controllers/studies/libraryItemController.js";

const router=express.Router();

router.get("/",getLibraryItems);
router.get("/:id",getLibraryItemById);
router.post("/",createLibraryItem);
router.put("/:id",updateLibraryItem);
router.delete("/:id",deleteLibraryItem);

export default router;