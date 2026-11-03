import express from "express";
import {getUserSetting,updateUserSetting} from "../../controllers/userSetting/userSettingController.js";

const router=express.Router();

router.get("/",getUserSetting);
router.put("/",updateUserSetting);

export default router;