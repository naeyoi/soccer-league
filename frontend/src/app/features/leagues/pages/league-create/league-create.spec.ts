import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter, Router } from '@angular/router';
import { LeagueCreatePage } from './league-create';

describe('LeagueCreatePage', () => {
  let httpTestingController: HttpTestingController;
  let routeLeagueId: string | null;

  beforeEach(async () => {
    routeLeagueId = null;
    await TestBed.configureTestingModule({
      imports: [LeagueCreatePage],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: {
                get: () => routeLeagueId,
                has: () => routeLeagueId !== null,
              },
            },
          },
        },
      ],
    }).compileComponents();
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpTestingController.verify());

  it('should post valid league data to the API', () => {
    const router = TestBed.inject(Router);
    vi.spyOn(router, 'navigateByUrl').mockResolvedValue(true);
    const fixture = TestBed.createComponent(LeagueCreatePage);
    fixture.detectChanges();
    httpTestingController.expectOne('/api/Teams').flush([
      { id: 2, name: 'Arsenal', country: 'England', playersQuantity: 18, enabled: true, leagueIds: [] },
    ]);
    const page = fixture.componentInstance;

    page.leagueForm.setValue({
      name: '  Premier League  ',
      country: ' England ',
      startDate: '2026-08-01',
      endDate: '2027-05-31',
      enabled: true,
      teamIds: [2],
    });
    page.createLeague();

    const request = httpTestingController.expectOne('/api/Leagues');
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({
      name: 'Premier League',
      country: 'England',
      startDate: '2026-08-01T00:00:00',
      endDate: '2027-05-31T00:00:00',
      teamIds: [2],
    });
    request.flush({ id: 1 });
    expect(router.navigateByUrl).toHaveBeenCalledWith('/leagues');
  });

  it('should show a validation error and block submission when the end date is before the start date', () => {
    const fixture = TestBed.createComponent(LeagueCreatePage);
    fixture.detectChanges();
    httpTestingController.expectOne('/api/Teams').flush([]);
    const page = fixture.componentInstance;

    page.leagueForm.setValue({
      name: 'League',
      country: 'Country',
      startDate: '2027-05-31',
      endDate: '2026-08-01',
      enabled: true,
      teamIds: [],
    });
    page.createLeague();
    fixture.detectChanges();

    expect(page.leagueForm.controls.endDate.hasError('endDateBeforeStartDate')).toBe(true);
    expect(fixture.nativeElement.textContent).toContain('End date must be on or after start date.');
    httpTestingController.expectNone('/api/Leagues');
  });

  it('should load an existing league and send its changes to the API', () => {
    routeLeagueId = '1';
    const router = TestBed.inject(Router);
    vi.spyOn(router, 'navigateByUrl').mockResolvedValue(true);
    const fixture = TestBed.createComponent(LeagueCreatePage);
    fixture.detectChanges();

    const getRequest = httpTestingController.expectOne('/api/Leagues/1');
    expect(getRequest.request.method).toBe('GET');
    getRequest.flush({
      id: 1,
      name: 'Premier League',
      country: 'England',
      startDate: '2026-08-01T00:00:00',
      endDate: '2027-05-31T00:00:00',
      enabled: true,
      teamIds: [2],
    });

    const teamsRequest = httpTestingController.expectOne('/api/Teams');
    expect(teamsRequest.request.method).toBe('GET');
    teamsRequest.flush([
    { id: 2, name: 'Arsenal', country: 'England', playersQuantity: 18, enabled: true, leagueIds: [1] },
    ]);

    fixture.detectChanges();
    expect(fixture.componentInstance.leagueForm.getRawValue()).toEqual({
      name: 'Premier League',
      country: 'England',
      startDate: '2026-08-01',
      endDate: '2027-05-31',
      enabled: true,
      teamIds: [2],
    });

    fixture.componentInstance.leagueForm.controls.name.setValue('Premier League Updated');
    fixture.componentInstance.createLeague();

    const putRequest = httpTestingController.expectOne('/api/Leagues/1');
    expect(putRequest.request.method).toBe('PUT');
    expect(putRequest.request.body).toEqual({
      id: 1,
      name: 'Premier League Updated',
      country: 'England',
      startDate: '2026-08-01T00:00:00',
      endDate: '2027-05-31T00:00:00',
      enabled: true,
      teamIds: [2],
    });
    putRequest.flush(null);
    expect(router.navigateByUrl).toHaveBeenCalledWith('/leagues');
  });
});
