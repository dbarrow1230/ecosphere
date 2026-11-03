import express from "express";
import {
 createHomeItem,
 getHomeItems,
 getHomeItemById,
 updateHomeItem,
 deleteHomeItem
} from "../../controllers/home/homeItemController.js";

const router=express.Router();

router.post("/",createHomeItem);
router.get("/",getHomeItems);
router.get("/:id",getHomeItemById);
router.put("/:id",updateHomeItem);
router.delete("/:id",deleteHomeItem);

export default router;
