import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { environment } from 'environment';
import { UserSearchResult } from '../models/UserSearchResult';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = `${environment.apiUrl}/api/User`;

  constructor(private http: HttpClient) { }

  searchUsers(searchTerm: string, projectId: number): Observable<UserSearchResult[]> {
    const params = new HttpParams()
      .set('searchTerm', searchTerm)
      .set('projectId', projectId.toString());

    return this.http.get<UserSearchResult[]>(`${this.apiUrl}/search`, { params });
  }

  searchProjectAssignees(searchTerm: string, projectId: number): Observable<UserSearchResult[]> {
    const params = new HttpParams()
      .set('searchTerm', searchTerm)
      .set('projectId', projectId.toString());

    return this.http.get<UserSearchResult[]>(`${this.apiUrl}/search-project-assignees`, { params });
  }
}