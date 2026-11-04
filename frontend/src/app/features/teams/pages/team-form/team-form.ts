import { HttpErrorResponse } from '@angular/common/http';
import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { forkJoin, Observable } from 'rxjs';
import { League } from '../../../leagues/models/league';
import { LeagueService } from '../../../leagues/services/league.service';
import { TeamService } from '../../services/team.service';

@Component({
  imports: [
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatSlideToggleModule,
    ReactiveFormsModule,
    RouterLink,
  ],
  selector: 'app-team-form',
  templateUrl: './team-form.html',
  styleUrl: './team-form.scss',
})
export class TeamFormPage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);
  private readonly formBuilder = inject(FormBuilder);
  private readonly leagueService = inject(LeagueService);
  private readonly router = inject(Router);
  private readonly teamService = inject(TeamService);

  readonly teamForm = this.formBuilder.nonNullable.group({
    name: ['', [Validators.required, Validators.pattern(/\S/), Validators.maxLength(50)]],
    country: ['', [Validators.required, Validators.pattern(/\S/), Validators.maxLength(50)]],
    playersQuantity: [11, [Validators.required, Validators.min(11), Validators.max(22), Validators.pattern(/^\d+$/)]],
    enabled: [true],
    leagueIds: this.formBuilder.nonNullable.control<number[]>([]),
  });

  leagues: League[] = [];
  teamId: number | null = null;
  loadingTeam = false;
  relatedDataReady = false;
  submitting = false;
  errorMessage: string | null = null;

  ngOnInit(): void {
    const idParameter = this.route.snapshot.paramMap.get('id');
    if (idParameter !== null) {
      const id = Number(idParameter);
      if (!Number.isSafeInteger(id) || id <= 0) {
        this.errorMessage = 'Invalid team ID.';
        return;
      }

      this.teamId = id;
      this.loadingTeam = true;
      forkJoin({
        team: this.teamService.getById(id),
        leagues: this.leagueService.getAll(),
      })
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: ({ team, leagues }) => {
            this.leagues = leagues;
            this.teamForm.patchValue({
              name: team.name,
              country: team.country,
              playersQuantity: team.playersQuantity,
              enabled: team.enabled,
              leagueIds: team.leagueIds ?? [],
            });
            this.loadingTeam = false;
            this.relatedDataReady = true;
          },
          error: (error: unknown) => {
            console.error(`Failed to load team ${id}.`, error);
            this.errorMessage = getApiErrorMessage(error);
            this.loadingTeam = false;
            this.relatedDataReady = false;
          },
        });
    } else {
      this.leagueService.getAll()
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: (leagues) => {
            this.leagues = leagues;
            this.relatedDataReady = true;
          },
          error: (error: unknown) => {
            console.error('Failed to load leagues for team assignment.', error);
            this.errorMessage = getApiErrorMessage(error);
            this.relatedDataReady = false;
          },
        });
    }
  }

  saveTeam(): void {
    this.errorMessage = null;
    this.teamForm.markAllAsTouched();
    if (
      this.teamForm.invalid ||
      this.submitting ||
      this.loadingTeam ||
      !this.relatedDataReady ||
      (this.teamId === null && this.route.snapshot.paramMap.has('id'))
    ) {
      return;
    }

    this.submitting = true;
    const formValue = this.teamForm.getRawValue();
    const teamData = {
      name: formValue.name.trim(),
      country: formValue.country.trim(),
      playersQuantity: formValue.playersQuantity,
      leagueIds: formValue.leagueIds,
    };
    const teamId = this.teamId;
    const request: Observable<unknown> = teamId === null
      ? this.teamService.create(teamData)
      : this.teamService.update({
          ...teamData,
          id: teamId,
          enabled: formValue.enabled,
        });

    request.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        void this.router.navigateByUrl('/teams');
      },
      error: (error: unknown) => {
        console.error(`Failed to ${this.teamId === null ? 'create' : 'update'} team.`, error);
        this.errorMessage = getApiErrorMessage(error);
        this.submitting = false;
      },
    });
  }
}

function getApiErrorMessage(error: unknown): string {
  if (!(error instanceof HttpErrorResponse)) {
    return 'Unable to save the team. Please try again.';
  }

  const body: unknown = error.error;
  if (typeof body !== 'object' || body === null) {
    return 'Unable to save the team. Please try again.';
  }

  const response = body as { message?: unknown; errors?: unknown };
  const message = typeof response.message === 'string' ? response.message : null;
  const validationErrors = Array.isArray(response.errors)
    ? response.errors.flatMap((item: unknown) => {
        if (typeof item !== 'object' || item === null) {
          return [];
        }
        const validationError = item as { property?: unknown; error?: unknown };
        return typeof validationError.error === 'string'
          ? [`${typeof validationError.property === 'string' ? `${validationError.property}: ` : ''}${validationError.error}`]
          : [];
      })
    : [];

  return [message, ...validationErrors].filter((part): part is string => part !== null).join(' ') ||
    'Unable to save the team. Please try again.';
}
