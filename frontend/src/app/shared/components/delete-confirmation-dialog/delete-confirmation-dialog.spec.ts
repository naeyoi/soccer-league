import { TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { DeleteConfirmationDialog } from './delete-confirmation-dialog';

describe('DeleteConfirmationDialog', () => {
  it('should show a warning and expose cancel and delete actions', async () => {
    const dialogRef = { close: vi.fn() };
    await TestBed.configureTestingModule({
      imports: [DeleteConfirmationDialog],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: { entityName: 'Tigres', entityType: 'Team' } },
        { provide: MatDialogRef, useValue: dialogRef },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(DeleteConfirmationDialog);
    fixture.detectChanges();

    const element = fixture.nativeElement as HTMLElement;
    expect(element.textContent).toContain('Delete Team');
    expect(element.textContent).toContain('Are you sure you want to delete "Tigres"?');
    element.querySelector<HTMLButtonElement>('.cancel-button')?.click();
    expect(dialogRef.close).toHaveBeenLastCalledWith(false);
    element.querySelector<HTMLButtonElement>('.confirm-delete-button')?.click();
    expect(dialogRef.close).toHaveBeenLastCalledWith(true);
  });
});
