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
 validateResetToken
} from "../../controllers/users/authController.js";

const router=express.Router();

router.post("/login",loginUser);
router.post("/forgot-password",forgotPassword);
router.post("/reset-password",resetPassword);
router.get("/reset-password/:token",validateResetToken);
router.post("/reset-password/:token",resetPassword);

router.post("/",createUser);
router.get("/",getUsers);
router.get("/:id",getUserById);
router.put("/:id",updateUser);
router.delete("/:id",deleteUser);

export default router;
