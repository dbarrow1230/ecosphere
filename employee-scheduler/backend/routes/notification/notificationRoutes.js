// backend/routes/notifications/notificationRoutes.js
import express from "express";
import {
 createNotification,
 getNotifications,
 getNotificationById,
 updateNotification,
 markNotificationAsRead,
 markAllNotificationsAsRead,
 deleteNotification
} from "../../controllers/notification/notificationController.js";

const router=express.Router();

router.post("/",createNotification);
router.get("/",getNotifications);
router.get("/:id",getNotificationById);
router.put("/:id",updateNotification);
router.patch("/:id/read",markNotificationAsRead);
router.patch("/read/all",markAllNotificationsAsRead);
router.delete("/:id",deleteNotification);

export default router;