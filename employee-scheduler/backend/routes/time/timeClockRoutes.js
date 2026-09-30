import {Router} from "express";
import {getActiveEntry,recordClockIn,recordClockOut,recordBreakStart,recordBreakEnd} from "../../controllers/time/timeClockController.js";
const router=Router();
router.get("/active-entry",getActiveEntry);
router.post("/clock-in",recordClockIn);
router.post("/clock-out",recordClockOut);
router.post("/break-start",recordBreakStart);
router.post("/break-end",recordBreakEnd);
export default router;
