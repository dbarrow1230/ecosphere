// backend/routes/BookRoutes.js
import express from "express";
import {
 createBook,
 getBooks,
 getBookFilterOptions,
 getBookById,
 updateBook,
 deleteBook
} from "../controllers/BookController.js";

const router=express.Router();

router.post("/",createBook);
router.get("/filter-options",getBookFilterOptions);
router.get("/",getBooks);
router.get("/:id",getBookById);
router.put("/:id",updateBook);
router.delete("/:id",deleteBook);

export default router;