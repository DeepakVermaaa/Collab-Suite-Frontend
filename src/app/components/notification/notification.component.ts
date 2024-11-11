// src/app/components/notification/notification.component.ts
import { Component, OnInit, OnDestroy, ElementRef, HostListener } from '@angular/core';
import { NotificationService } from '../../services/notification.service';
import { Notification } from 'src/app/models/Notification';
import { Subscription } from 'rxjs';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
    selector: 'app-notification',
    templateUrl: './notification.component.html',
    styleUrls: ['./notification.component.css'],
    animations: [
        trigger('fadeSlide', [
            transition(':enter', [
                style({ opacity: 0, transform: 'translateY(-10px)' }),
                animate('200ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
            ]),
            transition(':leave', [
                animate('200ms ease-in', style({ opacity: 0, transform: 'translateY(-10px)' }))
            ])
        ])
    ]
})
export class NotificationComponent implements OnInit, OnDestroy {
    notifications: Notification[] = [];
    unreadCount = 0;
    showNotifications = false;
    showDeleteConfirm: number | null = null;
    private subscriptions: Subscription[] = [];

    constructor(
        private notificationService: NotificationService,
        private eRef: ElementRef
    ) {}

    @HostListener('document:click', ['$event'])
    clickout(event: any) {
        if (!this.eRef.nativeElement.contains(event.target)) {
            this.showNotifications = false;
            this.showDeleteConfirm = null;
        }
    }

    ngOnInit() {
        this.subscriptions.push(
            this.notificationService.getNotifications()
                .subscribe(notifications => this.notifications = notifications),
            
            this.notificationService.getUnreadCount()
                .subscribe(count => this.unreadCount = count)
        );
    }

    ngOnDestroy() {
        this.subscriptions.forEach(sub => sub.unsubscribe());
    }

    toggleNotifications(event: Event) {
        event.stopPropagation();
        this.showNotifications = !this.showNotifications;
        this.showDeleteConfirm = null; // Reset delete confirmation when toggling
    }

    markAsRead(event: Event, id: number) {
        event.stopPropagation();
        this.notificationService.markAsRead(id);
    }

    markAllAsRead(event: Event) {
        event.stopPropagation();
        this.notificationService.markAllAsRead();
    }

    initiateDelete(event: Event, id: number) {
        event.stopPropagation();
        this.showDeleteConfirm = id;
    }

    confirmDelete(event: Event, id: number) {
        event.stopPropagation();
        this.notificationService.deleteNotification(id);
        this.showDeleteConfirm = null;
    }

    cancelDelete(event: Event) {
        event.stopPropagation();
        this.showDeleteConfirm = null;
    }

    getNotificationIcon(type: string): string {
        switch (type) {
            case 'TaskAssigned':
                return 'fas fa-tasks';
            case 'ProjectDeadline':
                return 'fas fa-calendar-alt';
            case 'Mention':
                return 'fas fa-at';
            case 'TeamUpdate':
                return 'fas fa-users';
            default:
                return 'fas fa-bell';
        }
    }
}