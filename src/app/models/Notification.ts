import { NotificationType } from "./NotificationType";

export interface Notification {
    id: number;
    userId: number;
    message: string;
    type: NotificationType;
    referenceId?: string;
    isRead: boolean;
    createdAt: Date;
}