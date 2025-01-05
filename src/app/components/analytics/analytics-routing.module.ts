import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AnalyticsComponent } from './analytics.component';

const routes: Routes = [
  {
    path: '',
    component: AnalyticsComponent,
    children: [
    //   {
    //     path: '',
    //     component: AnalyticsDashboardComponent
    //   },
    //   {
    //     path: 'projects',
    //     component: ProjectAnalyticsComponent
    //   },
    //   {
    //     path: 'tasks',
    //     component: TaskAnalyticsComponent
    //   },
    //   {
    //     path: 'team',
    //     component: TeamPerformanceComponent
    //   }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AnalyticsRoutingModule { }