//backend/routes/finance/estimateRoutes.js
import express from "express";
import {createEstimate,getEstimates,getEstimateById,updateEstimate,deleteEstimate} from "../../controllers/finance/estimateController.js";

const router=express.Router();

router.route("/")
 .post(createEstimate)
 .get(getEstimates);

router.route("/:id")
 .get(getEstimateById)
 .put(updateEstimate)
 .delete(deleteEstimate);

export default router;