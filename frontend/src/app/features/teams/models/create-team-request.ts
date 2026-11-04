export interface CreateTeamRequest {
  name: string;
  country: string;
  playersQuantity: number;
  leagueIds: number[];
}
