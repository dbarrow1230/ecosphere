// backend/routes/scheduling/availabilityRoutes.js
import express from "express";
import {
 createAvailability,
 getAvailabilities,
 getAvailabilityById,
 getAvailabilityByEmployeeId,
 updateAvailability,
 deleteAvailability
} from "../../controllers/scheduling/availabilityController.js";

const router=express.Router();

router.post("/",createAvailability);
router.get("/",getAvailabilities);
router.get("/employee/:employeeId",getAvailabilityByEmployeeId);
router.get("/:id",getAvailabilityById);
router.put("/:id",updateAvailability);
router.delete("/:id",deleteAvailability);

export default router;