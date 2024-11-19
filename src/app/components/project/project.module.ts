import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ProjectRoutingModule } from './project-routing.module';
import { ProjectComponent } from './project.component';
import { ProjectService } from './service/project.service';
import { CreateProjectDialogComponent } from './create-project/create-project-dialog/create-project-dialog.component';


@NgModule({
  declarations: [
    ProjectComponent,
    CreateProjectDialogComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ProjectRoutingModule
  ],
  providers: [
    ProjectService
  ]
})
export class ProjectModule { }