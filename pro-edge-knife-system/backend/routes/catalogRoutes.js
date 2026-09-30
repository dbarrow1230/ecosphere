import express from "express";
import {createKnifeType,createTier,deleteKnifeType,getKnifeTypes,getTiers,seedCatalog,updateKnifeType,updateTier} from "../controllers/catalogController.js";

const router=express.Router();
router.post("/seed",seedCatalog);
router.get("/knife-types",getKnifeTypes);
router.post("/knife-types",createKnifeType);
router.put("/knife-types/:id",updateKnifeType);
router.delete("/knife-types/:id",deleteKnifeType);
router.get("/tiers",getTiers);
router.post("/tiers",createTier);
router.put("/tiers/:id",updateTier);
export default router;
