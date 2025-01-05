import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { environment } from 'environment';
import { DocumentFilterParams, DocumentResponse, DocumentUploadRequest, DocumentUpdateRequest, DocumentPermissionLevel, DocumentModel } from '../models/document.models';

@Injectable({
  providedIn: 'root'
})
export class DocumentManagementService {
  private apiUrl = `${environment.apiUrl}/api/Documents`;

  constructor(private http: HttpClient) { }

  getDocuments(params: DocumentFilterParams): Observable<DocumentResponse> {
    const cleanParams = Object.entries(params).reduce((acc, [key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        acc[key] = value.toString();
      }
      return acc;
    }, {} as Record<string, string>);

    const queryParams = new HttpParams({ fromObject: cleanParams });

    if (params.projectId) {
      return this.http.get<DocumentResponse>(`${this.apiUrl}/project/${params.projectId}`, { params: queryParams });
    }
    return this.http.get<DocumentResponse>(`${this.apiUrl}`, { params: queryParams });
  }

  getDocumentDetails(id: number): Observable<DocumentModel> {
    return this.http.get<DocumentModel>(`${this.apiUrl}/${id}`);
  }

  uploadDocument(request: DocumentUploadRequest): Observable<DocumentModel> {
    const formData = new FormData();
    formData.append('file', request.file);
    formData.append('projectId', request.projectId.toString());
    if (request.name) formData.append('name', request.name);
    if (request.description) formData.append('description', request.description);
    if (request.comment) formData.append('comment', request.comment);

    return this.http.post<DocumentModel>(this.apiUrl, formData);
  }

  updateDocumentVersion(id: number, request: DocumentUpdateRequest): Observable<any> {
    const formData = new FormData();
    formData.append('file', request.file);
    if (request.comment) formData.append('comment', request.comment);

    return this.http.put(`${this.apiUrl}/${id}/version`, formData);
  }

  deleteDocument(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  downloadDocument(id: number, versionId?: number): Observable<Blob> {
    let url = `${this.apiUrl}/${id}/download`;
    if (versionId) {
      url += `?versionId=${versionId}`;
    }
    return this.http.get(url, {
      responseType: 'blob'
    });
  }

  updatePermissions(
    documentId: number,
    userId: number,
    permissionLevel: DocumentPermissionLevel
  ): Observable<any> {
    return this.http.put(`${this.apiUrl}/${documentId}/permissions`, {
      userId,
      permissionLevel: Number(permissionLevel)
    });
  }

  removePermission(documentId: number, userId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${documentId}/permissions/${userId}`);
  }

  previewDocument(documentId: number, options: { format?: string } = {}): Observable<Blob | string> {
    const params = new HttpParams().set('format', options.format || 'raw');
    
    if (options.format === 'html') {
      return this.http.get(`${this.apiUrl}/${documentId}/preview`, {
        params,
        responseType: 'text'
      });
    } else {
      return this.http.get(`${this.apiUrl}/${documentId}/preview`, {
        params,
        responseType: 'blob'
      });
    }
  }
}