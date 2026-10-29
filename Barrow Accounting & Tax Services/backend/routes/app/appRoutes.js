// backend/routes/app/appRoutes.js
import express from "express";
import {
 getCurrentAppBusiness,
 getAppKeys,
 createAppKey,
 updateAppKey,
 deleteAppKey
} from "../../controllers/app/appController.js";

const router=express.Router();

router.get("/current-business/:appKey",getCurrentAppBusiness);

router.get("/app-keys",getAppKeys);
router.post("/app-keys",createAppKey);
router.put("/app-keys/:id",updateAppKey);
router.delete("/app-keys/:id",deleteAppKey);

export default router;