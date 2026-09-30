// backend/routes/users/departmentPermissionRoutes.js
import express from "express";
import {
 createDepartmentPermission,
 getDepartmentPermissions,
 getDepartmentPermissionById,
 updateDepartmentPermission,
 deleteDepartmentPermission
} from "../../controllers/users/departmentPermissionController.js";

const router=express.Router();

router.route("/")
 .get(getDepartmentPermissions)
 .post(createDepartmentPermission);

router.route("/:id")
 .get(getDepartmentPermissionById)
 .put(updateDepartmentPermission)
 .delete(deleteDepartmentPermission);

export default router;
