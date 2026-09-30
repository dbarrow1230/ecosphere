// backend/routes/donnations/DonationRoutes.js
import express from "express";
import {createDonation,deleteDonation,getDonationById,getDonations,updateDonationStatus} from "../../controllers/donnations/DonationController.js";

const router=express.Router();

router.post("/",createDonation);
router.get("/",getDonations);
router.get("/:id",getDonationById);
router.put("/:id",updateDonationStatus);
router.delete("/:id",deleteDonation);

export default router;