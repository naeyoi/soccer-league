import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter, Router } from '@angular/router';
import { TeamFormPage } from './team-form';

describe('TeamFormPage', () => {
  let httpTestingController: HttpTestingController;
  let routeTeamId: string | null;

  beforeEach(async () => {
    routeTeamId = null;
    await TestBed.configureTestingModule({
      imports: [TeamFormPage],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: {
                get: () => routeTeamId,
                has: () => routeTeamId !== null,
              },
            },
          },
        },
      ],
    }).compileComponents();
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpTestingController.verify());

  it('should create a team with trimmed values', () => {
    const router = TestBed.inject(Router);
    vi.spyOn(router, 'navigateByUrl').mockResolvedValue(true);
    const fixture = TestBed.createComponent(TeamFormPage);
    fixture.detectChanges();
    httpTestingController.expectOne('/api/Leagues').flush([
      {
        id: 3,
        name: 'Premier League',
        country: 'England',
        startDate: '2026-08-01T00:00:00',
        endDate: '2027-05-31T00:00:00',
        enabled: true,
        teamIds: [],
      },
    ]);
    const page = fixture.componentInstance;
    page.teamForm.setValue({
      name: ' Arsenal ',
      country: ' England ',
      playersQuantity: 18,
      enabled: true,
      leagueIds: [3],
    });

    page.saveTeam();
    const request = httpTestingController.expectOne('/api/Teams');
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({
      name: 'Arsenal',
      country: 'England',
      playersQuantity: 18,
      leagueIds: [3],
    });
    request.flush({ id: 1 });
    expect(router.navigateByUrl).toHaveBeenCalledWith('/teams');
  });

  it('should prevent submitting invalid player quantities', () => {
    const fixture = TestBed.createComponent(TeamFormPage);
    fixture.detectChanges();
    httpTestingController.expectOne('/api/Leagues').flush([]);
    const page = fixture.componentInstance;
    page.teamForm.setValue({
      name: 'Arsenal',
      country: 'England',
      playersQuantity: 23,
      enabled: true,
      leagueIds: [],
    });

    page.saveTeam();

    expect(page.teamForm.controls.playersQuantity.hasError('max')).toBe(true);
    httpTestingController.expectNone('/api/Teams');
  });

  it('should load a team and submit all update fields', () => {
    routeTeamId = '7';
    const router = TestBed.inject(Router);
    vi.spyOn(router, 'navigateByUrl').mockResolvedValue(true);
    const fixture = TestBed.createComponent(TeamFormPage);
    fixture.detectChanges();

    const getRequest = httpTestingController.expectOne('/api/Teams/7');
    expect(getRequest.request.method).toBe('GET');
    getRequest.flush({
      id: 7,
      name: 'Arsenal',
      country: 'England',
      playersQuantity: 18,
      enabled: true,
      leagueIds: [3],
    });
    const leaguesRequest = httpTestingController.expectOne('/api/Leagues');
    expect(leaguesRequest.request.method).toBe('GET');
    leaguesRequest.flush([
      {
        id: 3,
        name: 'Premier League',
        country: 'England',
        startDate: '2026-08-01T00:00:00',
        endDate: '2027-05-31T00:00:00',
        enabled: true,
        teamIds: [7],
      },
    ]);
    fixture.componentInstance.teamForm.controls.name.setValue('Arsenal Women');
    fixture.componentInstance.teamForm.controls.enabled.setValue(false);
    fixture.componentInstance.saveTeam();

    const updateRequest = httpTestingController.expectOne('/api/Teams/7');
    expect(updateRequest.request.method).toBe('PUT');
    expect(updateRequest.request.body).toEqual({
      id: 7,
      name: 'Arsenal Women',
      country: 'England',
      playersQuantity: 18,
      enabled: false,
      leagueIds: [3],
    });
    updateRequest.flush(null);
    expect(router.navigateByUrl).toHaveBeenCalledWith('/teams');
  });
});
