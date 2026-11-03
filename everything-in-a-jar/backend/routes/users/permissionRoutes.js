// backend/routes/users/permissionRoutes.js
import express from "express";
import {
 createPermission,
 getPermissions,
 getPermissionById,
 updatePermission,
 deletePermission
} from "../../controllers/users/permissionController.js";

const router=express.Router();

router.post("/",createPermission);
router.get("/",getPermissions);
router.get("/:id",getPermissionById);
router.put("/:id",updatePermission);
router.delete("/:id",deletePermission);

export default router;