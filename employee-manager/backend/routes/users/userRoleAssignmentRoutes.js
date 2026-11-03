// backend/routes/users/userRoleAssignmentRoutes.js
import express from "express";
import {
 createUserRoleAssignment,
 getUserRoleAssignments,
 getUserRoleAssignmentById,
 updateUserRoleAssignment,
 deleteUserRoleAssignment
} from "../../controllers/users/userRoleAssignmentController.js";

const router=express.Router();

router.route("/")
 .post(createUserRoleAssignment)
 .get(getUserRoleAssignments);

router.route("/:id")
 .get(getUserRoleAssignmentById)
 .put(updateUserRoleAssignment)
 .delete(deleteUserRoleAssignment);

export default router;