import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { MatDialog } from '@angular/material/dialog';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Subject } from 'rxjs';
import { League } from '../../models/league';
import { LeagueListPage } from './league-list';

describe('LeagueListPage', () => {
  let httpTestingController: HttpTestingController;
  let confirmation: Subject<boolean>;

  beforeEach(async () => {
    confirmation = new Subject<boolean>();
    await TestBed.configureTestingModule({
      imports: [LeagueListPage],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
      ],
    }).compileComponents();
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpTestingController.verify());

  it('should render one table row for each league returned by the API', async () => {
    const fixture = TestBed.createComponent(LeagueListPage);
    fixture.detectChanges();

    const request = httpTestingController.expectOne('/api/Leagues');
    expect(request.request.method).toBe('GET');
    request.flush([
      {
        id: 1,
        name: 'Premier League',
        country: 'England',
        startDate: '2026-08-01T00:00:00',
        endDate: '2027-05-31T00:00:00',
        enabled: true,
        teamIds: [],
      },
      {
        id: 2,
        name: 'La Liga',
        country: 'Spain',
        startDate: '2026-08-15T00:00:00',
        endDate: '2027-05-25T00:00:00',
        enabled: false,
        teamIds: [],
      },
    ]);

    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(fixture.componentInstance.loading).toBe(false);
    expect(fixture.componentInstance.dataSource.data).toHaveLength(2);
    const rows = fixture.nativeElement.querySelectorAll('tbody tr');
    expect(rows).toHaveLength(2);
    expect(rows[0].textContent).toContain('Premier League');
    expect(rows[0].textContent).toContain('England');
    expect(rows[1].textContent).toContain('La Liga');
    expect(rows[1].textContent).toContain('Spain');
    const enabledToggle = rows[0].querySelector('mat-slide-toggle button[role="switch"]');
    const disabledToggle = rows[1].querySelector('mat-slide-toggle button[role="switch"]');
    expect(enabledToggle?.getAttribute('aria-checked')).toBe('true');
    expect(enabledToggle?.hasAttribute('disabled')).toBe(false);
    expect(disabledToggle?.getAttribute('aria-checked')).toBe('false');
    expect(rows[0].querySelectorAll('button[mat-icon-button]')).toHaveLength(2);
    expect(rows[0].querySelector('[aria-label="Edit Premier League"]')).toBeTruthy();
    expect(rows[0].querySelector('[aria-label="Delete Premier League"]')).toBeTruthy();
  });

  it('should delete the league when the confirmation is accepted', () => {
    const fixture = TestBed.createComponent(LeagueListPage);
    const dialog = fixture.debugElement.injector.get(MatDialog);
    const openDialog = vi.spyOn(dialog, 'open').mockReturnValue(
      { afterClosed: () => confirmation.asObservable() } as never,
    );
    const league: League = {
      id: 1,
      name: 'Premier League',
      country: 'England',
      startDate: '2026-08-01T00:00:00',
      endDate: '2027-05-31T00:00:00',
      enabled: true,
      teamIds: [],
    };
    fixture.componentInstance.dataSource.data = [league];
    fixture.componentInstance.confirmDelete(league);
    expect(openDialog).toHaveBeenCalledWith(expect.any(Function), {
      data: { entityName: league.name, entityType: 'League' },
    });

    confirmation.next(true);
    const deleteRequest = httpTestingController.expectOne('/api/Leagues/1');
    expect(deleteRequest.request.method).toBe('DELETE');
    deleteRequest.flush(null);

    expect(fixture.componentInstance.dataSource.data).toHaveLength(0);
  });

  it('should not delete the league when the confirmation is cancelled', () => {
    const fixture = TestBed.createComponent(LeagueListPage);
    const dialog = fixture.debugElement.injector.get(MatDialog);
    vi.spyOn(dialog, 'open').mockReturnValue(
      { afterClosed: () => confirmation.asObservable() } as never,
    );
    const league: League = {
      id: 1,
      name: 'Premier League',
      country: 'England',
      startDate: '2026-08-01T00:00:00',
      endDate: '2027-05-31T00:00:00',
      enabled: true,
      teamIds: [],
    };
    fixture.componentInstance.confirmDelete(league);

    confirmation.next(false);
    httpTestingController.expectNone('/api/Leagues/1');
  });

  it('should update the enabled state through the API', async () => {
    const fixture = TestBed.createComponent(LeagueListPage);
    fixture.detectChanges();
    httpTestingController.expectOne('/api/Leagues').flush([
      {
        id: 1,
        name: 'Premier League',
        country: 'England',
        startDate: '2026-08-01T00:00:00',
        endDate: '2027-05-31T00:00:00',
        enabled: true,
        teamIds: [],
      },
    ]);
    await fixture.whenStable();

    const league = fixture.componentInstance.dataSource.data[0];
    fixture.componentInstance.setEnabled(league, false);
    expect(fixture.componentInstance.dataSource.data[0].enabled).toBe(false);

    const request = httpTestingController.expectOne('/api/Leagues/1/enabled');
    expect(request.request.method).toBe('PATCH');
    expect(request.request.body).toEqual({ enabled: false });
    request.flush(null);
    expect(fixture.componentInstance.dataSource.data[0].enabled).toBe(false);
    expect(fixture.componentInstance.dataSource.data[0].enabled).toBe(false);
  });

  it('should allow another toggle while the previous API update is pending', async () => {
    const fixture = TestBed.createComponent(LeagueListPage);
    fixture.detectChanges();
    httpTestingController.expectOne('/api/Leagues').flush([
      {
        id: 1,
        name: 'Premier League',
        country: 'England',
        startDate: '2026-08-01T00:00:00',
        endDate: '2027-05-31T00:00:00',
        enabled: true,
        teamIds: [],
      },
    ]);
    await fixture.whenStable();

    const league = fixture.componentInstance.dataSource.data[0];
    fixture.componentInstance.setEnabled(league, false);
    const disableRequest = httpTestingController.expectOne('/api/Leagues/1/enabled');
    expect(disableRequest.request.body).toEqual({ enabled: false });

    fixture.componentInstance.setEnabled(fixture.componentInstance.dataSource.data[0], true);
    const enableRequest = httpTestingController.expectOne('/api/Leagues/1/enabled');
    expect(enableRequest.request.body).toEqual({ enabled: true });

    disableRequest.flush(null);
    enableRequest.flush(null);
    expect(fixture.componentInstance.dataSource.data[0].enabled).toBe(true);
  });

  it('should restore the previous enabled state when the API update fails', async () => {
    const fixture = TestBed.createComponent(LeagueListPage);
    fixture.detectChanges();
    httpTestingController.expectOne('/api/Leagues').flush([
      {
        id: 1,
        name: 'Premier League',
        country: 'England',
        startDate: '2026-08-01T00:00:00',
        endDate: '2027-05-31T00:00:00',
        enabled: true,
        teamIds: [],
      },
    ]);
    await fixture.whenStable();

    const league = fixture.componentInstance.dataSource.data[0];
    fixture.componentInstance.setEnabled(league, false);
    const request = httpTestingController.expectOne('/api/Leagues/1/enabled');
    request.flush({}, { status: 500, statusText: 'Server Error' });

    expect(fixture.componentInstance.dataSource.data[0].enabled).toBe(true);
    expect(fixture.componentInstance.errorMessage).toContain('Unable to update');
  });
});
