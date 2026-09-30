import express from "express";
import {
 getPrefixes,
 getPrefixById,
 createPrefix,
 updatePrefix,
 deletePrefix
} from "../controllers/prefixController.js";

const router=express.Router();

router.route("/")
 .get(getPrefixes)
 .post(createPrefix);

router.route("/:id")
 .get(getPrefixById)
 .put(updatePrefix)
 .delete(deletePrefix);

export default router;