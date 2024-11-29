import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ProjectRoutingModule } from './project-routing.module';
import { ProjectComponent } from './project.component';
import { ProjectService } from './service/project.service';
import { CreateProjectDialogComponent } from './create-project-dialog/create-project-dialog.component';
import { ProjectDetailComponent } from './project-detail/project-detail.component';
import { CreateMilestoneModalComponent } from './create-milestone-modal/create-milestone-modal.component';
import { ProjectDialogComponent } from './project-dialog/project-dialog.component';
import { TaskProjectDetailComponent } from './task-project-detail/task-project-detail.component';
import { NgxEchartsModule } from 'ngx-echarts';
import { ProjectTeamComponent } from './project-team/project-team.component';


@NgModule({
  declarations: [
    ProjectComponent,
    CreateProjectDialogComponent,
    ProjectDetailComponent,
    CreateMilestoneModalComponent,
    ProjectDialogComponent,
    TaskProjectDetailComponent,
    ProjectTeamComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ProjectRoutingModule,
    NgxEchartsModule.forRoot({
      echarts: () => import('echarts')
    })
  ],
  providers: [
    ProjectService
  ]
})
export class ProjectModule { }