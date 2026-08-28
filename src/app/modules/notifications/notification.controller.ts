import { Request, Response, NextFunction } from "express";
import { NotificationService } from "./notification.service";

const getMyNotifications = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }
    const userId = req.user.userId || (req.user as any).id;
    const result = await NotificationService.getMyNotifications(userId, req.query);

    res.status(200).json({
      success: true,
      message: "Notifications fetched successfully",
      data: result.data,
      meta: result.meta,
    });
  } catch (error) {
    next(error);
  }
};

const getUnreadNotifications = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }
    const userId = req.user.userId || (req.user as any).id;
    const result = await NotificationService.getUnreadNotifications(userId);

    res.status(200).json({
      success: true,
      message: "Unread notifications fetched successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const getUnreadNotificationCount = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }
    const userId = req.user.userId || (req.user as any).id;
    const result = await NotificationService.getUnreadNotificationCount(userId);

    res.status(200).json({
      success: true,
      message: "Unread notification count fetched successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const markNotificationAsRead = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }
    const userId = req.user.userId || (req.user as any).id;
    const notificationId = req.params.id as string;
    const result = await NotificationService.markNotificationAsRead(userId, notificationId);

    res.status(200).json({
      success: true,
      message: "Notification marked as read successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const markAllNotificationsAsRead = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }
    const userId = req.user.userId || (req.user as any).id;
    const result = await NotificationService.markAllNotificationsAsRead(userId);

    res.status(200).json({
      success: true,
      message: "All notifications marked as read successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const deleteNotification = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }
    const userId = req.user.userId || (req.user as any).id;
    const notificationId = req.params.id as string;
    await NotificationService.deleteNotification(userId, notificationId);

    res.status(200).json({
      success: true,
      message: "Notification deleted successfully",
      data: null,
    });
  } catch (error) {
    next(error);
  }
};

export const NotificationController = {
  getMyNotifications,
  getUnreadNotifications,
  getUnreadNotificationCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
};
