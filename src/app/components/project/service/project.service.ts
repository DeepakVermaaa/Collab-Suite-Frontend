import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { environment } from 'environment';
import { ProjectsResponse } from 'src/app/models/ProjectResponse';
import { ProjectRole, ProjectStatus } from '../models/enums/enums';
import { Project } from '../models/project.model';
import { ProjectDetailResponse } from '../models/ProjectDetailResponse';
import { MilestoneCreateDto } from '../models/MilestoneCreateDto';
import { ProjectMilestoneDetail } from '../models/projectMilestone';
import { ProjectCreateDto } from '../models/ProjectCreateDto';
import { ProjectMemberResponse } from '../models/ProjectMemberResponse';
import { ProjectMemberAddDto } from '../models/ProjectMemberAddDto';

@Injectable({
  providedIn: 'root'
})
export class ProjectService {
  private apiUrl = `${environment.apiUrl}/api/Project`

  constructor(private http: HttpClient) { }

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

  getProjectDetails(id: number): Observable<ProjectDetailResponse> {
    return this.http.get<ProjectDetailResponse>(`${this.apiUrl}/${id}`);
  }

  createProject(project: { name: string; description: string }): Observable<Project> {
    return this.http.post<Project>(this.apiUrl, project);
  }

  deleteProject(id: number) {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  createMilestone(projectId: number, milestone: MilestoneCreateDto) {
    return this.http.post(
      `${this.apiUrl}/${projectId}/milestones`,
      milestone
    );
  }

  updateMilestone(milestoneId: number, milestone: Partial<ProjectMilestoneDetail>): Observable<any> {
    return this.http.put(`${this.apiUrl}/milestones/${milestoneId}`, milestone);
  }

  deleteMilestone(milestoneId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/milestones/${milestoneId}`);
  }

  updateProject(id: number, project: ProjectCreateDto): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, project);
  }

  addProjectMember(projectId: number, memberDto: ProjectMemberAddDto): Observable<ProjectMemberResponse> {
    return this.http.post<ProjectMemberResponse>(
      `${this.apiUrl}/${projectId}/members`,
      memberDto
    );
  }

  removeMember(projectId: number, userId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${projectId}/members/${userId}`);
  }

  updateMemberRole(projectId: number, userId: number, role: ProjectRole): Observable<any> {
    return this.http.put(`${this.apiUrl}/${projectId}/members/${userId}/role`, { 
      role: Number(role)
    });
  }
}