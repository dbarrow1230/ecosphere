// backend/routes/gardens/gardenRoutes.js
import express from "express";
import {
createGarden,
getGardens,
getGardenById,
updateGarden,
addGardenNote,
deleteGarden
} from "../../controllers/gardens/gardenController.js";

const router=express.Router();

router.post("/",createGarden);
router.get("/",getGardens);
router.get("/:id",getGardenById);
router.put("/:id",updateGarden);
router.patch("/:id/notes",addGardenNote);
router.delete("/:id",deleteGarden);

export default router;