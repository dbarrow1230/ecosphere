import express from "express";
import {
 createNotebook,
 getNotebooks,
 getNotebookById,
 updateNotebook,
 deleteNotebook
} from "../controllers/notebookController.js";
import {protect} from "../middleware/authMiddleware.js";

const router=express.Router();

router.post("/",protect,createNotebook);
router.get("/",protect,getNotebooks);
router.get("/:id",protect,getNotebookById);
router.put("/:id",protect,updateNotebook);
router.delete("/:id",protect,deleteNotebook);

export default router;