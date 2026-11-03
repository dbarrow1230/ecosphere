import {Router} from "express";
import {getAvailability,saveAvailability} from "../../controllers/employees/availabilityController.js";
const router=Router();
router.get("/",getAvailability);
router.post("/",saveAvailability);
export default router;
