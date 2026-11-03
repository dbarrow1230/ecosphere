// backend/routes/users/userDepartmentAssignmentRoutes.js
import express from "express";
import {
 createUserDepartmentAssignment,
 getUserDepartmentAssignments,
 getUserDepartmentAssignmentById,
 updateUserDepartmentAssignment,
 deleteUserDepartmentAssignment
} from "../../controllers/users/userDepartmentAssignmentController.js";

const router=express.Router();

router.route("/")
 .post(createUserDepartmentAssignment)
 .get(getUserDepartmentAssignments);

router.route("/:id")
 .get(getUserDepartmentAssignmentById)
 .put(updateUserDepartmentAssignment)
 .delete(deleteUserDepartmentAssignment);

export default router;
