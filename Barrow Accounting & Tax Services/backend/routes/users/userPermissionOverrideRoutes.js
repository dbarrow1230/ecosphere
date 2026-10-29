// backend/routes/users/userPermissionOverrideRoutes.js
import express from "express";
import {
 createUserPermissionOverride,
 getUserPermissionOverrides,
 getUserPermissionOverrideById,
 updateUserPermissionOverride,
 deleteUserPermissionOverride
} from "../../controllers/users/userPermissionOverrideController.js";

const router=express.Router();

router.route("/")
 .post(createUserPermissionOverride)
 .get(getUserPermissionOverrides);

router.route("/:id")
 .get(getUserPermissionOverrideById)
 .put(updateUserPermissionOverride)
 .delete(deleteUserPermissionOverride);

export default router;