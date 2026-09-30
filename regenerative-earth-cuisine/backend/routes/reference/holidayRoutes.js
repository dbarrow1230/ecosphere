// backend/routes/reference/holidayRoutes.js
import express from "express";
import {
 createHoliday,
 getHolidays,
 getHolidayById,
 updateHoliday,
 deleteHoliday
} from "../../controllers/reference/holidayController.js";

const router=express.Router();

router.route("/")
 .get(getHolidays)
 .post(createHoliday);

router.route("/:id")
 .get(getHolidayById)
 .put(updateHoliday)
 .delete(deleteHoliday);

export default router;