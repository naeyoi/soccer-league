import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';

export interface DeleteConfirmationData {
  entityName: string;
  entityType: string;
}

@Component({
  imports: [MatButtonModule, MatDialogModule],
  selector: 'app-delete-confirmation-dialog',
  styleUrl: './delete-confirmation-dialog.scss',
  templateUrl: './delete-confirmation-dialog.html',
})
export class DeleteConfirmationDialog {
  readonly data = inject<DeleteConfirmationData>(MAT_DIALOG_DATA);
  private readonly dialogRef = inject(MatDialogRef<DeleteConfirmationDialog, boolean>);

  cancel(): void {
    this.dialogRef.close(false);
  }

  confirm(): void {
    this.dialogRef.close(true);
  }
}
