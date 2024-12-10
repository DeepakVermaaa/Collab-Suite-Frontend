import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'environment';
import { ProjectDropdownDto } from '../../team-chat/models/ProjectDropdownDto';
import { TaskStatus } from '../../project/models/enums/enums';
import { TaskFilterDto } from '../model/TaskFilterDto';

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private apiUrl = `${environment.apiUrl}/api/task`;

  constructor(private http: HttpClient) { }

  getUserProjects() {
    return this.http.get<ProjectDropdownDto[]>(`${environment.apiUrl}/api/Chat/projects`);
  }

  getTasks(params: Partial<TaskFilterDto>): Observable<any> {
    const defaultParams: TaskFilterDto = {
      pageNumber: 1,
      pageSize: 10,
      assignedToMe: false,
      createdByMe: false,
      ...params
    };

    const cleanParams = Object.entries(defaultParams).reduce((acc, [key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        acc[key] = value instanceof Date ? value.toISOString() : value.toString();
      }
      return acc;
    }, {} as Record<string, string>);

    const queryParams = new HttpParams({ fromObject: cleanParams });
    return this.http.get(this.apiUrl, { params: queryParams });
  }

  updateTaskStatus(taskId: number, newStatus: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/${taskId}/status`, { newStatus });
  }

  createTask(task: any): Observable<any> {
    return this.http.post(this.apiUrl, task);
  }

  updateTask(taskId: number, task: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${taskId}`, task);
  }

  getTaskDetails(taskId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${taskId}`);
  }

  addComment(taskId: number, comment: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/${taskId}/comments`, { content: comment });
  }

  addAttachment(taskId: number, file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post(`${this.apiUrl}/${taskId}/attachments`, formData);
  }

  removeAttachment(taskId: number, attachmentId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${taskId}/attachments/${attachmentId}`);
  }
}