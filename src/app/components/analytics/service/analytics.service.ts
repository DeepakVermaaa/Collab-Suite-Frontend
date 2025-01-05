import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'environment';
import { OverviewAnalytics, TasksDistribution, TeamPerformance } from '../models/analytics.models';

@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {
  private apiUrl = `${environment.apiUrl}/api/Analytics`;

  constructor(private http: HttpClient) { }

  getOverviewAnalytics(): Observable<OverviewAnalytics> {
    return this.http.get<OverviewAnalytics>(`${this.apiUrl}/overview`);
  }

  getTasksDistribution(): Observable<TasksDistribution> {
    return this.http.get<TasksDistribution>(`${this.apiUrl}/tasks-distribution`);
  }

  getTeamPerformance(): Observable<TeamPerformance[]> {
    return this.http.get<TeamPerformance[]>(`${this.apiUrl}/team-performance`);
  }
}