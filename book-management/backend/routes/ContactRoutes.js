// backend/routes/ContactRoutes.js
import express from "express";
import {createContact,getContacts,getContactById,updateContact,deleteContact} from "../controllers/ContactController.js";

const router=express.Router();

router.post("/",createContact);
router.get("/",getContacts);
router.get("/:id",getContactById);
router.put("/:id",updateContact);
router.delete("/:id",deleteContact);

export default router;