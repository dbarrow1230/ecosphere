// backend/routes/gardens/gardenSectionRoutes.js
import express from "express";
import {
createGardenSection,
getGardenSections,
getGardenSectionById,
updateGardenSection,
addGardenSectionNote,
deleteGardenSection
} from "../../controllers/gardens/gardenSectionController.js";

const router=express.Router();

router.post("/",createGardenSection);
router.get("/",getGardenSections);
router.get("/:id",getGardenSectionById);
router.put("/:id",updateGardenSection);
router.patch("/:id/notes",addGardenSectionNote);
router.delete("/:id",deleteGardenSection);

export default router;