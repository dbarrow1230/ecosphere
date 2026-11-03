import {getCurrentProfile} from "../../controllers/users/currentProfileController.js";
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
 resetPassword
} from "../../controllers/users/authController.js";

const router=express.Router();

router.post("/login",loginUser);
router.post("/forgot-password",forgotPassword);
router.post("/reset-password",resetPassword);

router.post("/",createUser);
router.get("/",getUsers);
router.get("/me/profile",getCurrentProfile);
router.get("/:id",getUserById);
router.put("/:id",updateUser);
router.delete("/:id",deleteUser);

export default router;
