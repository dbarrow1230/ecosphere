import express from "express";
import{
 createUserDetails,
 getUserDetails,
 getUserDetailsById,
 updateUserDetails,
 deleteUserDetails
}from "../../controllers/users/userDetailsController.js";

const router=express.Router();

router.post("/",createUserDetails);

router.get("/",getUserDetails);

/* fetch details by user id */
router.get("/user/:userId",getUserDetails);

router.get("/:id",getUserDetailsById);

router.put("/:id",updateUserDetails);

router.delete("/:id",deleteUserDetails);

export default router;