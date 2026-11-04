export interface UpdateLeagueRequest {
  id: number;
  name: string;
  country: string;
  startDate: string;
  endDate: string;
  enabled: boolean;
  teamIds: number[];
}
