import express from "express";
import {
  createFamily,
  getFamilies,
  getFamilyById,
  updateFamily,
  deleteFamily
} from "../../controllers/species/familyController.js";

const router = express.Router();

router.post("/", createFamily);
router.get("/", getFamilies);
router.get("/:id", getFamilyById);
router.put("/:id", updateFamily);
router.delete("/:id", deleteFamily);

export default router;