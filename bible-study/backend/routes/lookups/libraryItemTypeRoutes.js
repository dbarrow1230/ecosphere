// backend/routes/lookups/libraryItemTypeRoutes.js
import express from "express";
import {
 getLibraryItemTypes,
 getLibraryItemTypeById,
 createLibraryItemType,
 updateLibraryItemType,
 deleteLibraryItemType
} from "../../controllers/lookups/libraryItemTypeController.js";

const router=express.Router();

router.get("/",getLibraryItemTypes);
router.get("/:id",getLibraryItemTypeById);
router.post("/",createLibraryItemType);
router.put("/:id",updateLibraryItemType);
router.delete("/:id",deleteLibraryItemType);

export default router;