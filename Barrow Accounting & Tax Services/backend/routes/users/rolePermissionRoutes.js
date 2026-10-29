// backend/routes/users/rolePermissionRoutes.js
import express from "express";
import {
 createRolePermission,
 getRolePermissions,
 getRolePermissionById,
 updateRolePermission,
 deleteRolePermission
} from "../../controllers/users/rolePermissionController.js";

const router=express.Router();

router.route("/")
 .get(getRolePermissions)
 .post(createRolePermission);

router.route("/:id")
 .get(getRolePermissionById)
 .put(updateRolePermission)
 .delete(deleteRolePermission);

export default router;