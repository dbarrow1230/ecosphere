import express from "express";
import {
 getMarineCodes,
 getMarineCode,
 createMarineCode,
 updateMarineCode,
 deleteMarineCode
} from "../../controllers/reference/marineCodeController.js";

const router=express.Router();

router.get("/",getMarineCodes);
router.get("/:id",getMarineCode);
router.post("/",createMarineCode);
router.put("/:id",updateMarineCode);
router.delete("/:id",deleteMarineCode);

export default router;