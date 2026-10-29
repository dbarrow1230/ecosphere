// backend/routes/users/businessDepartmentRoutes.js
import express from "express";
import {
 createBusinessDepartment,
 getBusinessDepartments,
 getBusinessDepartmentById,
 updateBusinessDepartment,
 deleteBusinessDepartment
} from "../../controllers/users/businessDepartmentController.js";

const router=express.Router();

router.route("/")
 .get(getBusinessDepartments)
 .post(createBusinessDepartment);

router.route("/:id")
 .get(getBusinessDepartmentById)
 .put(updateBusinessDepartment)
 .delete(deleteBusinessDepartment);

export default router;