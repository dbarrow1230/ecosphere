import express from "express";
import {protect} from "../middleware/authMiddleware.js";
import {requestAccess} from "../middleware/requestAccess.js";
import {listClients,getClient,clientOverview,createClient,updateClient} from "../controllers/clientController.js";
const router=express.Router();router.use(protect,requestAccess);
router.get("/",listClients);router.post("/",createClient);router.get("/:id/overview",clientOverview);router.get("/:id",getClient);router.put("/:id",updateClient);
export default router;
