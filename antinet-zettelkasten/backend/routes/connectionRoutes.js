import express from "express";
import {
 getConnections,
 getConnectionById,
 createConnection,
 updateConnection,
 archiveConnection,
 deleteConnection
} from "../controllers/connectionController.js";

const router=express.Router();

router.route("/")
 .get(getConnections)
 .post(createConnection);

router.patch("/:id/archive",archiveConnection);

router.route("/:id")
 .get(getConnectionById)
 .put(updateConnection)
 .delete(deleteConnection);

export default router;