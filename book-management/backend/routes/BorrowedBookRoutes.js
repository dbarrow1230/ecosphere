// backend/routes/BorrowedBookRoutes.js
import express from "express";
import {
 createBorrowedBook,
 getBorrowedBooks,
 getBorrowedBookFilterOptions,
 getBorrowedBookById,
 updateBorrowedBook,
 deleteBorrowedBook
} from "../controllers/BorrowedBookController.js";

const router=express.Router();

router.get("/filter-options",getBorrowedBookFilterOptions);

router.route("/")
 .get(getBorrowedBooks)
 .post(createBorrowedBook);

router.route("/:id")
 .get(getBorrowedBookById)
 .put(updateBorrowedBook)
 .delete(deleteBorrowedBook);

export default router;