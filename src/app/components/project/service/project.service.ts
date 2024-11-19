import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Project, ProjectStatus } from '../models/project.model';
import { Injectable } from '@angular/core';
import { environment } from 'environment';
import { ProjectsResponse } from 'src/app/models/ProjectResponse';

@Injectable({
  providedIn: 'root'
})
export class ProjectService {
  private apiUrl = `${environment.apiUrl}/api/Project`

  constructor(private http: HttpClient) {}

  getProjects(params: {
    searchQuery?: string;
    status?: ProjectStatus | null;
    sortBy?: string;
    sortDirection?: 'asc' | 'desc';
    pageNumber?: number;
    pageSize?: number;
  }): Observable<ProjectsResponse> {
    const cleanParams = Object.entries(params).reduce((acc, [key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        acc[key] = value.toString();
      }
      return acc;
    }, {} as Record<string, string>);

    const queryParams = new HttpParams({ fromObject: cleanParams });
    
    return this.http.get<ProjectsResponse>(`${this.apiUrl}`, { params: queryParams });
  }

  getProject(id: number): Observable<Project> {
    return this.http.get<Project>(`${this.apiUrl}/${id}`);
  }

  createProject(project: { name: string; description: string }): Observable<Project> {
    return this.http.post<Project>(this.apiUrl, project);
  }
}