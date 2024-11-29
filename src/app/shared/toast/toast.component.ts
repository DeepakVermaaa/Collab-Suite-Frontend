import { trigger, state, style, transition, animate } from '@angular/animations';
import { Component, Input, OnDestroy } from '@angular/core';

@Component({
  selector: 'app-toast',
  templateUrl: './toast.component.html',
  styleUrls: ['./toast.component.css'],
  animations: [
    trigger('toastTrigger', [
      state('void', style({
        transform: 'translateX(100%)',
        opacity: 0
      })),
      transition(':enter', [
        animate('300ms ease-out', style({
          transform: 'translateX(0)',
          opacity: 1
        }))
      ]),
      transition(':leave', [
        animate('200ms ease-in', style({
          transform: 'translateX(100%)',
          opacity: 0
        }))
      ])
    ])
  ]
})
export class ToastComponent  {
  @Input() type: 'error' | 'success' | 'warning' = 'success';
  @Input() message: string = '';
  state: string = 'active';

  hide() {
    this.state = 'void';
  }
}