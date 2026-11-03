import express from "express";
import {getDomains,createDomain,updateDomain,deleteDomain} from "../controllers/domainController.js";
const router=express.Router();
router.route("/").get(getDomains).post(createDomain);
router.route("/:id").put(updateDomain).delete(deleteDomain);
export default router;
