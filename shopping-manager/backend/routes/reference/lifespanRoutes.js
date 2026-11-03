// backend/routes/reference/lifespanRoutes.js
import express from "express";
import {
  getLifespans,
  getLifespanById,
  createLifespan,
  updateLifespan,
  deleteLifespan
} from "../../controllers/reference/lifespanController.js";

const router = express.Router();

router.route("/")
  .get(getLifespans)
  .post(createLifespan);

router.route("/:id")
  .get(getLifespanById)
  .put(updateLifespan)
  .delete(deleteLifespan);

export default router;