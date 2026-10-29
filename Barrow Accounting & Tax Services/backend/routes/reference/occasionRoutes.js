// backend/routes/reference/occasionRoutes.js
import express from "express";
import {
 createOccasion,
 getOccasions,
 getOccasionById,
 updateOccasion,
 deleteOccasion
} from "../../controllers/reference/occasionController.js";

const router=express.Router();

router.route("/")
 .get(getOccasions)
 .post(createOccasion);

router.route("/:id")
 .get(getOccasionById)
 .put(updateOccasion)
 .delete(deleteOccasion);

export default router;