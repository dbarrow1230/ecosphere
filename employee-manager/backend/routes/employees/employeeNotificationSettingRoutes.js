// backend/routes/employees/employeeNotificationSettingRoutes.js
import express from "express";
import {
 createEmployeeNotificationSetting,
 deleteEmployeeNotificationSetting,
 getEmployeeNotificationSettings,
 updateEmployeeNotificationSetting
} from "../../controllers/employees/employeeNotificationSettingController.js";

const router=express.Router();

router.post("/",createEmployeeNotificationSetting);
router.get("/",getEmployeeNotificationSettings);
router.put("/:id",updateEmployeeNotificationSetting);
router.delete("/:id",deleteEmployeeNotificationSetting);

export default router;
