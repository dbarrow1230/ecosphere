// backend/routes/users/effectivePermissionRoutes.js
import express from "express";
import {getEffectivePermissions} from "../../controllers/users/effectivePermissionController.js";

const router=express.Router();

router.get("/",getEffectivePermissions);

export default router;