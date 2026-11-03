import express from "express";
import CateringContract from "../models/cateringContractModel.js";
import {createDocumentController} from "../controllers/cateringDocumentController.js";

const router=express.Router();
const controller=createDocumentController(CateringContract,"Catering contract");
router.route("/").get(controller.list).post(controller.create);
router.route("/:id").get(controller.get).put(controller.update).delete(controller.remove);
export default router;
