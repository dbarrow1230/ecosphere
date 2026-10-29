// backend/routes/users/userRolesRoutes.js
import express from "express";
import {
 createRole,
 getRoles,
 getRoleById,
 updateRole,
 deleteRole
} from "../../controllers/users/userRolesController.js";

const router=express.Router();

router.route("/")
 .post(createRole)
 .get(getRoles);

router.route("/:id")
 .get(getRoleById)
 .put(updateRole)
 .delete(deleteRole);

export default router;