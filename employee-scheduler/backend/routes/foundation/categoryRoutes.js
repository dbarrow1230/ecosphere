// backend/routes/foundation/departmentRoutes.js
import express from "express";
import {
 createDepartment,
 getDepartments,
 getDepartmentById,
 updateDepartment,
 deleteDepartment
} from "../../controllers/foundation/departmentController.js";

const router=express.Router();

router.post("/",createDepartment);
router.get("/",getDepartments);
router.get("/:id",getDepartmentById);
router.put("/:id",updateDepartment);
router.delete("/:id",deleteDepartment);

export default router;