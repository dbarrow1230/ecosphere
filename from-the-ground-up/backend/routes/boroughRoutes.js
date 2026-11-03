// routes/boroughRoutes.js
import express from "express";
import {getBoroughs,getBoroughById,createBorough,updateBorough,deleteBorough} from "../controllers/boroughController.js";

const router=express.Router();

router.route("/")
 .get(getBoroughs)
 .post(createBorough);

router.route("/:id")
 .get(getBoroughById)
 .put(updateBorough)
 .delete(deleteBorough);

export default router;