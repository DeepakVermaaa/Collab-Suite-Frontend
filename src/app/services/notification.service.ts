import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { Notification } from '../models/Notification';
import { HubConnection, HubConnectionBuilder } from '@microsoft/signalr';
import { environment } from 'environment';

@Injectable({
    providedIn: 'root'
})
export class NotificationService {
    private apiUrl = environment.apiUrl;
    private hubConnection!: HubConnection;
    private notifications = new BehaviorSubject<Notification[]>([]);
    private unreadCount = new BehaviorSubject<number>(0);

    constructor(private http: HttpClient) {
        this.initializeSignalRConnection();
    }

    /** Initializes the SignalR connection for real-time notifications */
    private initializeSignalRConnection() {
        const token = localStorage.getItem('token');
        this.hubConnection = new HubConnectionBuilder()
            .withUrl(`${this.apiUrl}/notificationHub`, { 
                accessTokenFactory: () => token || '',
                withCredentials: true
              })
            .withAutomaticReconnect()
            .build();

        this.startConnection();
        this.addNotificationListener();
    }

    /** Starts the SignalR connection, with a retry mechanism on failure */
    private async startConnection() {
        try {
            await this.hubConnection.start();
            console.log('SignalR Connected');
            this.loadNotifications();
        } catch (err) {
            console.error('Error while connecting to SignalR:', err);
            setTimeout(() => this.startConnection(), 5000);
        }
    }

    /** Listens for new notifications and updates the local notification list */
    private addNotificationListener() {
        this.hubConnection.on('ReceiveNotification', (notification: Notification) => {
            const current = this.notifications.value;
            current.unshift(notification);
            this.notifications.next(current);
            this.updateUnreadCount();
        });
    }

    /** Updates the unread notification count */
    private updateUnreadCount() {
        const count = this.notifications.value.filter(n => !n.isRead).length;
        this.unreadCount.next(count);
    }

    /** Loads the notifications from the API */
    loadNotifications() {
        this.http.get<Notification[]>(`${this.apiUrl}/api/Notifications`)
            .subscribe({
                next: (notifications) => {
                    this.notifications.next(notifications);
                    this.updateUnreadCount();
                },
                error: (error) => console.error('Error loading notifications:', error)
            });
    }

    /** Returns an observable of all notifications */
    getNotifications(): Observable<Notification[]> {
        return this.notifications.asObservable();
    }

    /** Returns an observable of the unread notification count */
    getUnreadCount(): Observable<number> {
        return this.unreadCount.asObservable();
    }

    /** Marks a single notification as read in the API and updates the local list */
    markAsRead(notificationId: number) {
        return this.http.put(`${this.apiUrl}/api/Notifications/${notificationId}/read`, {})
            .subscribe({
                next: () => {
                    const updated = this.notifications.value.map(n =>
                        n.id === notificationId ? { ...n, isRead: true } : n
                    );
                    this.notifications.next(updated);
                    this.updateUnreadCount();
                },
                error: (error) => console.error('Error marking notification as read:', error)
            });
    }

    /** Marks all notifications as read in the API and updates the local list */
    markAllAsRead() {
        return this.http.put(`${this.apiUrl}/api/Notifications/mark-all-read`, {})
            .subscribe({
                next: () => {
                    const updated = this.notifications.value.map(n => ({ ...n, isRead: true }));
                    this.notifications.next(updated);
                    this.updateUnreadCount();
                },
                error: (error) => console.error('Error marking all notifications as read:', error)
            });
    }

    /** Deletes a notification and updates the local list */
    deleteNotification(notificationId: number) {
        return this.http.delete(`${this.apiUrl}/api/Notifications/${notificationId}`)
            .subscribe({
                next: () => {
                    const updated = this.notifications.value.filter(n => n.id !== notificationId);
                    this.notifications.next(updated);
                    this.updateUnreadCount();
                },
                error: (error) => console.error('Error deleting notification:', error)
            });
    }
}
