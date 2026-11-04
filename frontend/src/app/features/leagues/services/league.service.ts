import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { CreateLeagueRequest } from '../models/create-league-request';
import { League } from '../models/league';
import { UpdateLeagueRequest } from '../models/update-league-request';

export interface SetLeagueEnabledRequest {
  enabled: boolean;
}

export interface CreateLeagueResponse {
  id: number;
}

@Injectable({ providedIn: 'root' })
export class LeagueService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = '/api/Leagues';

  getAll(): Observable<League[]> {
    return this.http.get<League[]>(this.apiUrl);
  }

  getById(id: number): Observable<League> {
    return this.http.get<League>(`${this.apiUrl}/${id}`);
  }

  create(league: CreateLeagueRequest): Observable<CreateLeagueResponse> {
    return this.http.post<CreateLeagueResponse>(this.apiUrl, league);
  }

  update(league: UpdateLeagueRequest): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${league.id}`, league);
  }

  setEnabled(id: number, enabled: boolean): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/${id}/enabled`, { enabled } satisfies SetLeagueEnabledRequest);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
