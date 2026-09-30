// backend/routes/donnations/DonorContactRoutes.js
import express from "express";
import {
 createDonorContact,
 deleteDonorContact,
 getDonorContactById,
 getDonorContacts,
 updateDonorContact
} from "../../controllers/donnations/DonorContactController.js";

const router=express.Router();

router.post("/",createDonorContact);
router.get("/",getDonorContacts);
router.get("/:id",getDonorContactById);
router.put("/:id",updateDonorContact);
router.delete("/:id",deleteDonorContact);

export default router;