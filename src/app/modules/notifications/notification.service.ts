import { prisma } from "../../lib/prisma";
import { AppError } from "../../errors/AppError";
import { ICreateNotification, INotificationQuery } from "./notification.interface";
import { UserRole } from "@/generated/prisma/enums";

const createNotification = async (payload: ICreateNotification) => {
  const result = await prisma.notification.create({
    data: payload,
  });
  return result;
};

const notifyAdmins = async (title: string, message: string, type: any) => {
  const admins = await prisma.user.findMany({
    where: { role: UserRole.ADMIN, isDeleted: false },
    select: { id: true },
  });

  const notifications = admins.map((admin) => ({
    userId: admin.id,
    title,
    message,
    type,
  }));

  if (notifications.length > 0) {
    await prisma.notification.createMany({
      data: notifications,
    });
  }
};

const getMyNotifications = async (userId: string, query: INotificationQuery) => {
  const { page = 1, limit = 10, isRead } = query;
  
  let pageNumber = Number(page);
  let limitNumber = Number(limit);

  if (pageNumber < 1 || isNaN(pageNumber)) pageNumber = 1;
  if (limitNumber < 1 || isNaN(limitNumber)) limitNumber = 10;
  if (limitNumber > 100) limitNumber = 100;

  const skip = (pageNumber - 1) * limitNumber;

  const where: any = { userId };
  
  if (isRead !== undefined) {
    where.isRead = isRead === true || String(isRead) === "true";
  }

  const notifications = await prisma.notification.findMany({
    where,
    orderBy: { createdAt: "desc" },
    skip,
    take: limitNumber,
  });

  const total = await prisma.notification.count({ where });
  const totalPages = Math.ceil(total / limitNumber);

  return {
    data: notifications,
    meta: {
      page: pageNumber,
      limit: limitNumber,
      total,
      totalPages,
    }
  };
};

const getUnreadNotifications = async (userId: string) => {
  return await prisma.notification.findMany({
    where: { userId, isRead: false },
    orderBy: { createdAt: "desc" },
  });
};

const getUnreadNotificationCount = async (userId: string) => {
  const count = await prisma.notification.count({
    where: { userId, isRead: false },
  });
  return { count };
};

const markNotificationAsRead = async (userId: string, notificationId: string) => {
  const notification = await prisma.notification.findUnique({
    where: { id: notificationId },
  });

  if (!notification) {
    throw new AppError(404, "Notification not found");
  }

  if (notification.userId !== userId) {
    throw new AppError(403, "You do not have permission to modify this notification");
  }

  return await prisma.notification.update({
    where: { id: notificationId },
    data: { isRead: true },
  });
};

const markAllNotificationsAsRead = async (userId: string) => {
  return await prisma.notification.updateMany({
    where: { userId, isRead: false },
    data: { isRead: true },
  });
};

const deleteNotification = async (userId: string, notificationId: string) => {
  const notification = await prisma.notification.findUnique({
    where: { id: notificationId },
  });

  if (!notification) {
    throw new AppError(404, "Notification not found");
  }

  if (notification.userId !== userId) {
    throw new AppError(403, "You do not have permission to delete this notification");
  }

  return await prisma.notification.delete({
    where: { id: notificationId },
  });
};

export const NotificationService = {
  createNotification,
  notifyAdmins,
  getMyNotifications,
  getUnreadNotifications,
  getUnreadNotificationCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
};
