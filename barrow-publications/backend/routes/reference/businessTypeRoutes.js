// backend/routes/reference/businessTypeRoutes.js
import express from "express";
import {
 createBusinessType,
 getBusinessTypes,
 getBusinessTypeById,
 updateBusinessType,
 deleteBusinessType
} from "../../controllers/reference/businessTypeController.js";

const router=express.Router();

router.route("/")
 .post(createBusinessType)
 .get(getBusinessTypes);

router.route("/:id")
 .get(getBusinessTypeById)
 .put(updateBusinessType)
 .delete(deleteBusinessType);

export default router;