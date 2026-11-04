import { CreateTeamRequest } from './create-team-request';

export interface UpdateTeamRequest extends CreateTeamRequest {
  id: number;
  enabled: boolean;
}
