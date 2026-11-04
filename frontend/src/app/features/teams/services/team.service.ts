import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { CreateTeamRequest } from '../models/create-team-request';
import { Team } from '../models/team';
import { UpdateTeamRequest } from '../models/update-team-request';

@Injectable({ providedIn: 'root' })
export class TeamService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = '/api/Teams';

  getAll(): Observable<Team[]> {
    return this.http.get<Team[]>(this.apiUrl);
  }

  getById(id: number): Observable<Team> {
    return this.http.get<Team>(`${this.apiUrl}/${id}`);
  }

  create(team: CreateTeamRequest): Observable<{ id: number }> {
    return this.http.post<{ id: number }>(this.apiUrl, team);
  }

  update(team: UpdateTeamRequest): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${team.id}`, team);
  }

  setEnabled(id: number, enabled: boolean): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/${id}/enabled`, { enabled });
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
