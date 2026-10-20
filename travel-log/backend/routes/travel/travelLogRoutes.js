import {Router} from "express";
import {protect} from "../../middleware/authMiddleware.js";
import {list,get,create,update} from "../../controllers/travel/travelLogController.js";
const router=Router();
router.use(protect);
router.route("/").get(list).post(create);
router.route("/:id").get(get).put(update);
export default router;
