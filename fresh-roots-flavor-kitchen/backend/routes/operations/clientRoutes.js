import express from "express";
import {createClient,deleteClient,getClientById,getClients,updateClient} from "../../controllers/operations/clientController.js";

const router=express.Router();
router.get("/",getClients);
router.post("/",createClient);
router.get("/:id",getClientById);
router.put("/:id",updateClient);
router.delete("/:id",deleteClient);
export default router;
