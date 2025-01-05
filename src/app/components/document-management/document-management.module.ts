// document.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DocumentManagementService } from './service/document-management.service';
import { DocumentManagementRoutingModule } from './document-management-routing.module';
import { DocumentManagementComponent } from './document-management.component';
import { DocumentUploadComponent } from './document-upload/document-upload.component';
import { DocumentDetailsComponent } from './document-details/document-details.component';
import { DocumentPreviewerComponent } from './document-previewer/document-previewer.component';
import { ExcelPreviewComponent } from './document-previewer/excel-preview/excel-preview.component';
import { PdfPreviewComponent } from './document-previewer/pdf-preview/pdf-preview.component';
import { WordPreviewComponent } from './document-previewer/word-preview/word-preview.component';
import { TextPreviewComponent } from './document-previewer/text-preview/text-preview.component';


@NgModule({
  declarations: [
    DocumentManagementComponent,
    DocumentUploadComponent,
    DocumentDetailsComponent,
    DocumentPreviewerComponent,
    ExcelPreviewComponent,
    PdfPreviewComponent,
    WordPreviewComponent,
    TextPreviewComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    DocumentManagementRoutingModule
  ],
  providers: [
    DocumentManagementService
  ]
})
export class DocumentManagementModule { }