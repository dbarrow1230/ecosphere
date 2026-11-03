// backend/routes/employee/emergencyContactRoutes.js
import express from "express";
import {
 createEmergencyContact,
 getEmergencyContacts,
 getEmergencyContactById,
 updateEmergencyContact,
 deleteEmergencyContact
} from "../../controllers/employee/emergencyContactController.js";

const router=express.Router();

router.post("/",createEmergencyContact);
router.get("/",getEmergencyContacts);
router.get("/:id",getEmergencyContactById);
router.put("/:id",updateEmergencyContact);
router.delete("/:id",deleteEmergencyContact);

export default router;