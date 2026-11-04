export interface CreateLeagueRequest {
  name: string;
  country: string;
  startDate: string;
  endDate: string;
  teamIds: number[];
}
