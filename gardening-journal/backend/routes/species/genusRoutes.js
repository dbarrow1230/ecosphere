import express from "express";
import {
  createGenus,
  getGenera,
  getGenusById,
  updateGenus,
  deleteGenus
} from "../../controllers/species/genusController.js";

const router = express.Router();

router.post("/", createGenus);
router.get("/", getGenera);
router.get("/:id", getGenusById);
router.put("/:id", updateGenus);
router.delete("/:id", deleteGenus);

export default router;