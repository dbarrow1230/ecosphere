import express from "express";
import CateringOrder from "../models/cateringOrderModel.js";
import {createDocumentController} from "../controllers/cateringDocumentController.js";

const router=express.Router();
const controller=createDocumentController(CateringOrder,"Catering order");
router.route("/").get(controller.list).post(controller.create);
router.route("/:id").get(controller.get).put(controller.update).delete(controller.remove);
export default router;
