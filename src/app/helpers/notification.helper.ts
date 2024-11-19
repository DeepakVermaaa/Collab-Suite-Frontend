import { NotificationType } from '../models/NotificationType';

export class NotificationHelper {
    static getNotificationTypeString(type: NotificationType): string {
        return NotificationType[type];
    }

    static getNotificationIcon(type: NotificationType): string {
        switch (type) {
            case NotificationType.TaskAssigned:
                return 'fas fa-tasks';
            case NotificationType.TaskUpdated:
                return 'fas fa-edit';
            case NotificationType.ProjectDeadline:
                return 'fas fa-calendar-alt';
            case NotificationType.Mention:
                return 'fas fa-at';
            case NotificationType.TeamUpdate:
                return 'fas fa-users';
            case NotificationType.System:
            default:
                return 'fas fa-bell';
        }
    }

    static getNotificationClass(type: NotificationType): string {
        switch (type) {
            case NotificationType.TaskAssigned:
                return 'notification-task';
            case NotificationType.TaskUpdated:
                return 'notification-update';
            case NotificationType.ProjectDeadline:
                return 'notification-deadline';
            case NotificationType.Mention:
                return 'notification-mention';
            case NotificationType.TeamUpdate:
                return 'notification-team';
            case NotificationType.System:
                return 'notification-system';
            default:
                return '';
        }
    }
}