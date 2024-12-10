import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DragDropModule } from '@angular/cdk/drag-drop';

// Material Imports
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDialogModule } from '@angular/material/dialog';
import { MatMenuModule } from '@angular/material/menu';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatBadgeModule } from '@angular/material/badge';
import { TaskComponent } from './task.component';
import { TaskRoutingModule } from './task-routing.module';
import { MatCardModule } from '@angular/material/card';
import { FeatherModule } from 'angular-feather';
import { ArrowDown, ArrowUp, Minus, AlertTriangle, HelpCircle } from 'angular-feather/icons';
import { TaskDetailsComponent } from './task-details/task-details.component';
const icons = {
    ArrowDown,
    ArrowUp,
    Minus,
    AlertTriangle,
    HelpCircle
  };
@NgModule({
  declarations: [
    TaskComponent,
    TaskDetailsComponent
  ],
  imports: [
    FeatherModule.pick(icons),
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TaskRoutingModule,
    DragDropModule,
    
    // Material Modules
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatDialogModule,
    MatMenuModule,
    MatChipsModule,
    MatTooltipModule,
    MatProgressBarModule,
    MatBadgeModule
  ],
  exports: [TaskComponent]
})
export class TaskModule { }