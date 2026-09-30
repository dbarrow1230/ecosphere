// backend/routes/users/permissionModuleRoutes.js
import express from "express";
import {
 createPermissionModule,
 getPermissionModules,
 getPermissionModuleById,
 updatePermissionModule,
 deletePermissionModule
} from "../../controllers/users/permissionModuleController.js";

const router=express.Router();

router.route("/")
 .get(getPermissionModules)
 .post(createPermissionModule);

router.route("/:id")
 .get(getPermissionModuleById)
 .put(updatePermissionModule)
 .delete(deletePermissionModule);

export default router;