// backend/routes/BorrowSourceRoutes.js
import express from "express";
import {
 createBorrowSource,
 getBorrowSources,
 getBorrowSourceById,
 updateBorrowSource,
 deleteBorrowSource
} from "../controllers/BorrowSourceController.js";

const router=express.Router();

router.route("/")
 .get(getBorrowSources)
 .post(createBorrowSource);

router.route("/:id")
 .get(getBorrowSourceById)
 .put(updateBorrowSource)
 .delete(deleteBorrowSource);

export default router;