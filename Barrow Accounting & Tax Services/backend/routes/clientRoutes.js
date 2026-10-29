import {Router} from "express";
import {protect} from "../middleware/authMiddleware.js";
import {clientAccess} from "../middleware/clientAccess.js";
import {getClients,getClient,getAssignees,createClient,updateClient} from "../controllers/clientController.js";

const router=Router();
router.use(protect,clientAccess);
router.get("/",getClients);
router.get("/assignees",getAssignees);
router.get("/:id",getClient);
router.post("/",createClient);
router.put("/:id",updateClient);
export default router;
