import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { MatDialog } from '@angular/material/dialog';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Subject } from 'rxjs';
import { Team } from '../../models/team';
import { TeamListPage } from './team-list';

describe('TeamListPage', () => {
  let httpTestingController: HttpTestingController;
  let confirmation: Subject<boolean>;

  beforeEach(async () => {
    confirmation = new Subject<boolean>();
    await TestBed.configureTestingModule({
      imports: [TeamListPage],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
      ],
    }).compileComponents();
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpTestingController.verify());

  it('should render teams returned by the API with actions and enabled controls', async () => {
    const fixture = TestBed.createComponent(TeamListPage);
    fixture.detectChanges();

    const request = httpTestingController.expectOne('/api/Teams');
    expect(request.request.method).toBe('GET');
    request.flush([
      { id: 1, name: 'Arsenal', country: 'England', playersQuantity: 18, enabled: true, leagueIds: [] },
      { id: 2, name: 'Barcelona', country: 'Spain', playersQuantity: 22, enabled: false, leagueIds: [] },
    ]);

    await fixture.whenStable();
    fixture.detectChanges();
    const rows = fixture.nativeElement.querySelectorAll('tbody tr');

    expect(fixture.componentInstance.loading).toBe(false);
    expect(rows).toHaveLength(2);
    expect(rows[0].textContent).toContain('Arsenal');
    expect(rows[0].textContent).toContain('England');
    expect(rows[0].textContent).toContain('18');
    expect(rows[1].textContent).toContain('Barcelona');
    expect(rows[1].textContent).toContain('Spain');
    expect(rows[1].textContent).toContain('22');
    expect(rows[0].querySelector('[aria-label="Edit Arsenal"]')).toBeTruthy();
    expect(rows[0].querySelector('[aria-label="Delete Arsenal"]')).toBeTruthy();
    const enabledToggle = rows[0].querySelector('mat-slide-toggle button[role="switch"]');
    expect(enabledToggle?.getAttribute('aria-checked')).toBe('true');
    expect(enabledToggle?.hasAttribute('disabled')).toBe(false);
  });

  it('should remove the team when deletion is confirmed', () => {
    const fixture = TestBed.createComponent(TeamListPage);
    const dialog = fixture.debugElement.injector.get(MatDialog);
    const openDialog = vi.spyOn(dialog, 'open').mockReturnValue(
      { afterClosed: () => confirmation.asObservable() } as never,
    );
    const team: Team = {
      id: 1,
      name: 'Arsenal',
      country: 'England',
      playersQuantity: 18,
      enabled: true,
      leagueIds: [],
    };
    fixture.componentInstance.dataSource.data = [team];
    fixture.componentInstance.confirmDelete(team);

    expect(openDialog).toHaveBeenCalledWith(expect.any(Function), {
      data: { entityName: 'Arsenal', entityType: 'Team' },
    });
    confirmation.next(true);

    const request = httpTestingController.expectOne('/api/Teams/1');
    expect(request.request.method).toBe('DELETE');
    request.flush(null);
    expect(fixture.componentInstance.dataSource.data).toHaveLength(0);
  });

  it('should not delete the team when confirmation is cancelled', () => {
    const fixture = TestBed.createComponent(TeamListPage);
    const dialog = fixture.debugElement.injector.get(MatDialog);
    vi.spyOn(dialog, 'open').mockReturnValue(
      { afterClosed: () => confirmation.asObservable() } as never,
    );
    const team: Team = {
      id: 1,
      name: 'Arsenal',
      country: 'England',
      playersQuantity: 18,
      enabled: true,
      leagueIds: [],
    };
    fixture.componentInstance.confirmDelete(team);
    confirmation.next(false);
    httpTestingController.expectNone('/api/Teams/1');
  });

  it('should update enabled state and restore it if the API request fails', () => {
    const fixture = TestBed.createComponent(TeamListPage);
    const team: Team = {
      id: 1,
      name: 'Arsenal',
      country: 'England',
      playersQuantity: 18,
      enabled: true,
      leagueIds: [],
    };
    fixture.componentInstance.dataSource.data = [team];
    fixture.componentInstance.setEnabled(team, false);

    const request = httpTestingController.expectOne('/api/Teams/1/enabled');
    expect(request.request.method).toBe('PATCH');
    expect(request.request.body).toEqual({ enabled: false });
    expect(fixture.componentInstance.dataSource.data[0].enabled).toBe(false);
    request.flush({}, { status: 500, statusText: 'Server Error' });

    expect(fixture.componentInstance.dataSource.data[0].enabled).toBe(true);
    expect(fixture.componentInstance.errorMessage).toContain('Unable to update');
  });

  it('should allow another toggle while the previous API update is pending', () => {
    const fixture = TestBed.createComponent(TeamListPage);
    const team: Team = {
      id: 1,
      name: 'Arsenal',
      country: 'England',
      playersQuantity: 18,
      enabled: true,
      leagueIds: [],
    };
    fixture.componentInstance.dataSource.data = [team];

    fixture.componentInstance.setEnabled(team, false);
    const disableRequest = httpTestingController.expectOne('/api/Teams/1/enabled');
    fixture.componentInstance.setEnabled(fixture.componentInstance.dataSource.data[0], true);
    const enableRequest = httpTestingController.expectOne('/api/Teams/1/enabled');
    expect(disableRequest.request.body).toEqual({ enabled: false });
    expect(enableRequest.request.body).toEqual({ enabled: true });

    disableRequest.flush(null);
    enableRequest.flush(null);
    expect(fixture.componentInstance.dataSource.data[0].enabled).toBe(true);
  });
});
