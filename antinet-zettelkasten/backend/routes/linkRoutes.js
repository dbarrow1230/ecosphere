// backend/routes/linkRoutes.js
import express from "express";
import{
 createLink,
 getLinks,
 getLinkById,
 updateLink,
 deleteLink
}from "../controllers/linkController.js";

const router=express.Router();

router.post("/",createLink);
router.get("/",getLinks);
router.get("/:id",getLinkById);
router.put("/:id",updateLink);
router.delete("/:id",deleteLink);

export default router;