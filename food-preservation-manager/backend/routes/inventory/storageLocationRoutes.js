import express from "express";
import {createStorageLocation,deleteStorageLocation,getStorageLocationById,getStorageLocations,updateStorageLocation} from "../../controllers/inventory/storageLocationController.js";

const router=express.Router();

router.get("/",getStorageLocations);
router.get("/:id",getStorageLocationById);
router.post("/",createStorageLocation);
router.put("/:id",updateStorageLocation);
router.delete("/:id",deleteStorageLocation);

export default router;
