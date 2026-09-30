import express from "express";
import {protect} from "../../middleware/authMiddleware.js";
import {getShoots,getShoot,createShoot,updateShoot,deleteShoot} from "../../controllers/photography/shootController.js";
const router=express.Router();
router.use(protect);
router.route("/").get(getShoots).post(createShoot);
router.route("/:id").get(getShoot).put(updateShoot).delete(deleteShoot);
export default router;
