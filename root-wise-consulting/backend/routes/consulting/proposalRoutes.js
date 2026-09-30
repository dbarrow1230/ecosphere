//backend/routes/consulting/proposalRoutes.js
import express from "express";
import{
 createProposal,
 getProposals,
 getProposalById,
 updateProposal,
 deleteProposal,
 toggleProposalStatus
}from "../../controllers/consulting/proposalController.js";

const router=express.Router();

router.post("/",createProposal);
router.get("/",getProposals);
router.get("/:id",getProposalById);
router.put("/:id",updateProposal);
router.patch("/:id/toggle-active",toggleProposalStatus);
router.delete("/:id",deleteProposal);

export default router;