import express from "express";
import {
 createUser,
 getUsers,
 getUserById,
 updateUser,
 deleteUser
} from "../../controllers/users/userController.js";
import {
 loginUser,
 forgotPassword,
 resetPassword,
 ensureBusinessAccess
} from "../../controllers/users/authController.js";
import {protect} from "../../middleware/authMiddleware.js";

const router=express.Router();

router.post("/login",loginUser);
router.post("/forgot-password",forgotPassword);
router.post("/reset-password",resetPassword);
router.post("/ensure-business-access",protect,ensureBusinessAccess);

router.post("/",createUser);
router.get("/",getUsers);
router.get("/:id",getUserById);
router.put("/:id",updateUser);
router.delete("/:id",deleteUser);

export default router;
