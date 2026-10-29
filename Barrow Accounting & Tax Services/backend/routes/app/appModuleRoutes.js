// backend/routes/app/appModuleRoutes.js
import express from "express";
import {getModulesByAppKey} from "../../controllers/app/appModuleController.js";

const router=express.Router();

router.get("/app-key/:appKeyId",getModulesByAppKey);

export default router;