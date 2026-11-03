// backend/routes/planner/characterRoleRoutes.js
import express from "express";
import {
 getCharacterRoles,
 getCharacterRoleById,
 createCharacterRole,
 updateCharacterRole,
 archiveCharacterRole,
 deleteCharacterRole
} from "../../controllers/planner/characterRoleController.js";

const router=express.Router();

router.get("/",getCharacterRoles);
router.get("/:id",getCharacterRoleById);
router.post("/",createCharacterRole);
router.put("/:id",updateCharacterRole);
router.patch("/:id/archive",archiveCharacterRole);
router.delete("/:id",deleteCharacterRole);

export default router;