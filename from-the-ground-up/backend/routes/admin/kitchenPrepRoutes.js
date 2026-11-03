import express from "express";
import {getKitchenPrep} from "../../controllers/admin/kitchenPrepController.js";

const router=express.Router();

router.get("/",getKitchenPrep);

export default router;
