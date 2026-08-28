import { NotificationType } from "@/generated/prisma/enums";

export interface ICreateNotification {
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
}

export interface INotificationQuery {
  page?: number;
  limit?: number;
  isRead?: boolean;
}
