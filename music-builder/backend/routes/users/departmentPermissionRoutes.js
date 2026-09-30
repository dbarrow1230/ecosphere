import express from "express";
import {
 createDepartmentPermission,
 deleteDepartmentPermission,
 getDepartmentPermissionById,
 getDepartmentPermissions,
 updateDepartmentPermission
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
