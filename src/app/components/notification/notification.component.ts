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
})
export class NotificationComponent implements OnInit, OnDestroy {
    notifications: Notification[] = [];
    unreadCount = 0;
    showNotifications = false;
    private subscriptions: Subscription[] = [];

    constructor(private notificationService: NotificationService,
      private eRef: ElementRef
    ) {}

    @HostListener('document:click', ['$event'])
    clickout(event: any) {
        if (!this.eRef.nativeElement.contains(event.target)) {
            this.showNotifications = false;
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
    }

    markAsRead(id: number) {
        this.notificationService.markAsRead(id);
    }

    markAllAsRead() {
        this.notificationService.markAllAsRead();
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