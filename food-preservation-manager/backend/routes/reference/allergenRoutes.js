import express from "express";
import {
 createAllergen,
 getAllergens,
 getAllergenById,
 updateAllergen,
 deleteAllergen
} from "../../controllers/reference/allergenController.js";

const router=express.Router();

router.route("/")
 .post(createAllergen)
 .get(getAllergens);

router.route("/:id")
 .get(getAllergenById)
 .put(updateAllergen)
 .delete(deleteAllergen);

export default router;
