import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'leagues/create',
    loadComponent: () =>
      import('./features/leagues/pages/league-create/league-create').then((module) => module.LeagueCreatePage),
  },
  {
    path: 'leagues/:id/edit',
    loadComponent: () =>
      import('./features/leagues/pages/league-create/league-create').then((module) => module.LeagueCreatePage),
  },
  {
    path: 'leagues',
    loadComponent: () =>
      import('./features/leagues/pages/league-list/league-list').then((module) => module.LeagueListPage),
  },
  {
    path: 'teams/create',
    loadComponent: () =>
      import('./features/teams/pages/team-form/team-form').then((module) => module.TeamFormPage),
  },
  {
    path: 'teams/:id/edit',
    loadComponent: () =>
      import('./features/teams/pages/team-form/team-form').then((module) => module.TeamFormPage),
  },
  {
    path: 'teams',
    loadComponent: () =>
      import('./features/teams/pages/team-list/team-list').then((module) => module.TeamListPage),
  },
];
