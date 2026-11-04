import { Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { RouterLink } from '@angular/router';
import { DeleteConfirmationDialog } from '../../../../shared/components/delete-confirmation-dialog/delete-confirmation-dialog';
import { Team } from '../../models/team';
import { TeamService } from '../../services/team.service';

@Component({
  imports: [
    MatButtonModule,
    MatDialogModule,
    MatIconModule,
    MatSlideToggleModule,
    MatTableModule,
    RouterLink,
  ],
  selector: 'app-team-list',
  templateUrl: './team-list.html',
  styleUrl: './team-list.scss',
})
export class TeamListPage implements OnInit {
  readonly displayedColumns = ['name', 'country', 'playersQuantity', 'enabled', 'actions'];
  readonly dataSource = new MatTableDataSource<Team>([]);
  loading = true;
  errorMessage: string | null = null;

  constructor(
    private readonly dialog: MatDialog,
    private readonly teamService: TeamService,
  ) {}

  ngOnInit(): void {
    this.teamService.getAll().subscribe({
      next: (teams) => {
        this.dataSource.data = teams;
        this.loading = false;
      },
      error: (error: unknown) => {
        console.error('Failed to load teams.', error);
        this.errorMessage = 'Unable to load teams. Please try again later.';
        this.loading = false;
      },
    });
  }

  setEnabled(team: Team, enabled: boolean): void {
    if (enabled === team.enabled) {
      return;
    }

    const previousEnabled = team.enabled;
    this.errorMessage = null;
    this.updateTeamEnabledState(team.id, enabled);

    this.teamService.setEnabled(team.id, enabled).subscribe({
      error: (error: unknown) => {
        console.error(`Failed to update enabled state for team ${team.id}.`, error);
        const currentTeam = this.dataSource.data.find((item) => item.id === team.id);
        if (currentTeam?.enabled === enabled) {
          this.updateTeamEnabledState(team.id, previousEnabled);
        }
        this.errorMessage = `Unable to update "${team.name}". Please try again.`;
      },
    });
  }

  confirmDelete(team: Team): void {
    this.dialog.open(DeleteConfirmationDialog, {
      data: { entityName: team.name, entityType: 'Team' },
    }).afterClosed().subscribe((confirmed) => {
      if (!confirmed) {
        return;
      }

      this.teamService.delete(team.id).subscribe({
        next: () => {
          this.dataSource.data = this.dataSource.data.filter((item) => item.id !== team.id);
        },
        error: (error: unknown) => {
          console.error(`Failed to delete team ${team.id}.`, error);
          this.errorMessage = `Unable to delete "${team.name}". Please try again.`;
        },
      });
    });
  }

  private updateTeamEnabledState(id: number, enabled: boolean): void {
    this.dataSource.data = this.dataSource.data.map((team) =>
      team.id === id ? { ...team, enabled } : team,
    );
  }
}
