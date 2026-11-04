import { Component, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { RouterLink } from '@angular/router';
import { League } from '../../models/league';
import { LeagueService } from '../../services/league.service';
import { DeleteConfirmationDialog } from '../../../../shared/components/delete-confirmation-dialog/delete-confirmation-dialog';

@Component({
  imports: [
    DatePipe,
    MatButtonModule,
    MatDialogModule,
    MatIconModule,
    MatSlideToggleModule,
    MatTableModule,
    RouterLink,
  ],
  selector: 'app-league-list',
  templateUrl: './league-list.html',
  styleUrl: './league-list.scss',
})
export class LeagueListPage implements OnInit {
  readonly displayedColumns = ['name', 'country', 'startDate', 'endDate', 'enabled', 'actions'];
  readonly dataSource = new MatTableDataSource<League>([]);
  loading = true;
  errorMessage: string | null = null;

  constructor(
    private readonly dialog: MatDialog,
    private readonly leagueService: LeagueService,
  ) {}

  ngOnInit(): void {
    this.leagueService.getAll().subscribe({
      next: (leagues) => {
        this.dataSource.data = leagues;
        this.loading = false;
      },
      error: (error: unknown) => {
        console.error('Failed to load leagues.', error);
        this.errorMessage = 'Unable to load leagues. Please try again later.';
        this.loading = false;
      },
    });
  }

  setEnabled(league: League, enabled: boolean): void {
    if (enabled === league.enabled) {
      return;
    }

    const previousEnabled = league.enabled;
    this.errorMessage = null;
    this.updateLeagueEnabledState(league.id, enabled);

    this.leagueService.setEnabled(league.id, enabled).subscribe({
      error: (error: unknown) => {
        console.error(`Failed to update enabled state for league ${league.id}.`, error);
        const currentLeague = this.dataSource.data.find((item) => item.id === league.id);
        if (currentLeague?.enabled === enabled) {
          this.updateLeagueEnabledState(league.id, previousEnabled);
        }
        this.errorMessage = `Unable to update "${league.name}". Please try again.`;
      },
    });
  }

  confirmDelete(league: League): void {
    const dialogRef = this.dialog.open(DeleteConfirmationDialog, {
      data: { entityName: league.name, entityType: 'League' },
    });

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (!confirmed) {
        return;
      }

      this.leagueService.delete(league.id).subscribe({
        next: () => {
          this.dataSource.data = this.dataSource.data.filter((item) => item.id !== league.id);
        },
        error: (error: unknown) => {
          console.error(`Failed to delete league ${league.id}.`, error);
          this.errorMessage = `Unable to delete "${league.name}". Please try again.`;
        },
      });
    });
  }

  private updateLeagueEnabledState(id: number, enabled: boolean): void {
    this.dataSource.data = this.dataSource.data.map((league) =>
      league.id === id ? { ...league, enabled } : league,
    );
  }
}
