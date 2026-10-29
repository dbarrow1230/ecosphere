// backend/routes/reference/appKeyRoutes.js
import express from "express";
import {
 createAppKey,
 getAppKeys,
 getAppKeyById,
 updateAppKey,
 deleteAppKey
} from "../../controllers/reference/appKeyController.js";

const router=express.Router();

router.route("/")
 .post(createAppKey)
 .get(getAppKeys);

router.route("/:id")
 .get(getAppKeyById)
 .put(updateAppKey)
 .delete(deleteAppKey);

export default router;