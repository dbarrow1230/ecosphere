import express from "express";
import {getEmployeeSettings,saveEmployeeSettings} from "../../controllers/employees/employeeSettingsController.js";

const router=express.Router();

router.get("/",getEmployeeSettings);
router.put("/",saveEmployeeSettings);

export default router;
