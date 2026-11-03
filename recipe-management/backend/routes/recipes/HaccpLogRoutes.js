import express from "express";
import {createHaccpLog,deleteHaccpLog,getHaccpLogs,updateHaccpLog} from "../../controllers/recipes/HaccpLogController.js";
const router=express.Router();
router.get("/",getHaccpLogs);router.post("/",createHaccpLog);router.put("/:id",updateHaccpLog);router.delete("/:id",deleteHaccpLog);
export default router;
