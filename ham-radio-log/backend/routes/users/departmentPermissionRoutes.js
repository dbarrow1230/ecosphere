import express from "express";
import {createDepartmentPermission,deleteDepartmentPermission,getDepartmentPermissions,updateDepartmentPermission} from "../../controllers/users/departmentPermissionController.js";

const router=express.Router();
router.route("/").get(getDepartmentPermissions).post(createDepartmentPermission);
router.route("/:id").put(updateDepartmentPermission).delete(deleteDepartmentPermission);
export default router;
