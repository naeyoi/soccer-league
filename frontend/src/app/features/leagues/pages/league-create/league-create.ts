import { HttpErrorResponse } from '@angular/common/http';
import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, ValidatorFn, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { forkJoin, Observable } from 'rxjs';
import { Team } from '../../../teams/models/team';
import { TeamService } from '../../../teams/services/team.service';
import { LeagueService } from '../../services/league.service';

const minimumSqlDate = '1753-01-01';
const maximumSqlDate = '9999-12-31';

const sqlDateValidator: ValidatorFn = (control) => {
  const value = control.value;
  if (typeof value !== 'string' || value.length === 0) {
    return null;
  }

  return value >= minimumSqlDate && value <= maximumSqlDate ? null : { sqlDateRange: true };
};

const endDateNotBeforeStartDate: ValidatorFn = (control) => {
  const startDate = control.parent?.get('startDate')?.value;
  const endDate = control.value;

  return typeof startDate === 'string' &&
    typeof endDate === 'string' &&
    startDate.length > 0 &&
    endDate.length > 0 &&
    endDate < startDate
    ? { endDateBeforeStartDate: true }
    : null;
};

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
  selector: 'app-league-create',
  templateUrl: './league-create.html',
  styleUrl: './league-create.scss',
})
export class LeagueCreatePage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);
  private readonly formBuilder = inject(FormBuilder);
  private readonly leagueService = inject(LeagueService);
  private readonly teamService = inject(TeamService);
  private readonly router = inject(Router);

  readonly leagueForm = this.formBuilder.nonNullable.group(
    {
      name: ['', [Validators.required, Validators.pattern(/\S/), Validators.maxLength(50)]],
      country: ['', [Validators.required, Validators.pattern(/\S/), Validators.maxLength(50)]],
      startDate: ['', [Validators.required, sqlDateValidator]],
      endDate: ['', [Validators.required, sqlDateValidator, endDateNotBeforeStartDate]],
      enabled: [true],
      teamIds: this.formBuilder.nonNullable.control<number[]>([]),
    },
  );

  teams: Team[] = [];
  leagueId: number | null = null;
  loadingLeague = false;
  relatedDataReady = false;
  submitting = false;
  errorMessage: string | null = null;

  ngOnInit(): void {
    const idParameter = this.route.snapshot.paramMap.get('id');
    if (idParameter !== null) {
      const id = Number(idParameter);
      if (!Number.isSafeInteger(id) || id <= 0) {
        this.errorMessage = 'Invalid league ID.';
        return;
      }

      this.leagueId = id;
      this.loadingLeague = true;
      forkJoin({
        league: this.leagueService.getById(id),
        teams: this.teamService.getAll(),
      })
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: ({ league, teams }) => {
            this.teams = teams;
            this.leagueForm.patchValue({
              name: league.name,
              country: league.country,
              startDate: league.startDate.slice(0, 10),
              endDate: league.endDate.slice(0, 10),
              enabled: league.enabled,
              teamIds: league.teamIds ?? [],
            });
            this.loadingLeague = false;
            this.relatedDataReady = true;
          },
          error: (error: unknown) => {
            console.error(`Failed to load league ${id}.`, error);
            this.errorMessage = getApiErrorMessage(error);
            this.loadingLeague = false;
            this.relatedDataReady = false;
          },
        });
    } else {
      this.teamService.getAll()
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: (teams) => {
            this.teams = teams;
            this.relatedDataReady = true;
          },
          error: (error: unknown) => {
            console.error('Failed to load teams for league assignment.', error);
            this.errorMessage = getApiErrorMessage(error);
            this.relatedDataReady = false;
          },
        });
    }

    this.leagueForm.controls.startDate.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.leagueForm.controls.endDate.updateValueAndValidity());
  }

  createLeague(): void {
    this.errorMessage = null;
    this.leagueForm.markAllAsTouched();

    if (
      this.leagueForm.invalid ||
      this.submitting ||
      this.loadingLeague ||
      !this.relatedDataReady ||
      (this.leagueId === null && this.route.snapshot.paramMap.has('id'))
    ) {
      return;
    }

    this.submitting = true;
    const formValue = this.leagueForm.getRawValue();

    const leagueData = {
      name: formValue.name.trim(),
      country: formValue.country.trim(),
      startDate: `${formValue.startDate}T00:00:00`,
      endDate: `${formValue.endDate}T00:00:00`,
      teamIds: formValue.teamIds,
    };
    const leagueId = this.leagueId;
    const request: Observable<unknown> = leagueId === null
      ? this.leagueService.create(leagueData)
      : this.leagueService.update({ ...leagueData, id: leagueId, enabled: formValue.enabled });

    request.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        void this.router.navigateByUrl('/leagues');
      },
      error: (error: unknown) => {
        console.error(`Failed to ${this.leagueId === null ? 'create' : 'update'} league.`, error);
        this.errorMessage = getApiErrorMessage(error);
        this.submitting = false;
      },
    });
  }
}

function getApiErrorMessage(error: unknown): string {
  if (!(error instanceof HttpErrorResponse)) {
    return 'Unable to save the league. Please try again.';
  }

  const body: unknown = error.error;
  if (typeof body !== 'object' || body === null) {
    return 'Unable to save the league. Please try again.';
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
    'Unable to save the league. Please try again.';
}
