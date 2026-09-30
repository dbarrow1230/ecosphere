import express from "express";
import {getCurrentBusinessByAppKey} from "../../controllers/reference/appKeyController.js";

const router=express.Router();

router.get("/current-business/:appKey",getCurrentBusinessByAppKey);

export default router;
