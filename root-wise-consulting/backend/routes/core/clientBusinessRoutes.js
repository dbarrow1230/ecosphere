//backend/routes/core/clientBusinessRoutes.js
import express from "express";
import {
 createClientBusiness,
 getClientBusinesses,
 getClientBusinessById,
 updateClientBusiness,
 deleteClientBusiness,
 deactivateClientBusiness
} from "../../controllers/core/clientBusinessController.js";

const router=express.Router();

router.route("/")
 .post(createClientBusiness)
 .get(getClientBusinesses);

router.route("/:id")
 .get(getClientBusinessById)
 .put(updateClientBusiness)
 .delete(deleteClientBusiness);

router.route("/:id/deactivate")
 .patch(deactivateClientBusiness);

export default router;