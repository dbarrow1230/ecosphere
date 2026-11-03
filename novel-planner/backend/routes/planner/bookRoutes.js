// backend/routes/planner/bookRoutes.js
import express from "express";
import {
 getBooks,
 getBookById,
 saveBook,
 updateBook,
 archiveBook,
 getBookName,
 saveBookName,
 archiveBookName
} from "../../controllers/planner/bookController.js";

const router=express.Router();

router.get("/",getBooks);
router.post("/",saveBook);
router.get("/:id",getBookById);
router.put("/:id",updateBook);
router.patch("/:id/archive",archiveBook);
router.get("/:bookId/name",getBookName);
router.post("/:bookId/name",saveBookName);
router.put("/:bookId/name",saveBookName);
router.patch("/:bookId/name/archive",archiveBookName);

export default router;
