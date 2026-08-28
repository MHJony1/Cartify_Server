import { Router } from "express";
import { NotificationController } from "./notification.controller";
import { auth } from "../../middleware/auth";

const router = Router();

router.get("/", auth, NotificationController.getMyNotifications);

router.get("/unread", auth, NotificationController.getUnreadNotifications);

router.get("/unread-count", auth, NotificationController.getUnreadNotificationCount);

router.patch("/read-all", auth, NotificationController.markAllNotificationsAsRead);

router.patch("/:id/read", auth, NotificationController.markNotificationAsRead);

router.delete("/:id", auth, NotificationController.deleteNotification);

export const notificationRoutes = router;
