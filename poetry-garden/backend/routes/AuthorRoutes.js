// backend/routes/AuthorRoutes.js
import express from "express";
import {createAuthor,getAuthors,getAuthorById,updateAuthor,deleteAuthor} from "../controllers/AuthorController.js";

const router=express.Router();

router.post("/",createAuthor);
router.get("/",getAuthors);
router.get("/:id",getAuthorById);
router.put("/:id",updateAuthor);
router.delete("/:id",deleteAuthor);

export default router;