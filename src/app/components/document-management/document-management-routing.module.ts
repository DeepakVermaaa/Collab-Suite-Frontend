// document-routing.module.ts
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DocumentManagementComponent } from './document-management.component';

const routes: Routes = [
  {
    path: '',
    component: DocumentManagementComponent
  },
//   {
//     path: ':id',
//     component: DocumentDetailComponent
//   }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DocumentManagementRoutingModule { }