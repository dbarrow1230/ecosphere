import express from "express";
import {createFileLookup,deleteFileLookup,listFileLookups,updateFileLookup} from "../controllers/fileLookupController.js";

const router=express.Router();
router.get("/",listFileLookups);
router.post("/",createFileLookup);
router.put("/:id",updateFileLookup);
router.delete("/:id",deleteFileLookup);
export default router;
