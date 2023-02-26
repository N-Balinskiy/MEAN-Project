import { Injectable } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';

import { ToastSeverity } from '../enums/toast-severity.enum';

@Injectable({ providedIn: 'root' })
export class SnackBarService {
  constructor(private snackBar: MatSnackBar) {}

  openSuccessSnackBar(message: string) {
    this.openSnackBar(message, ToastSeverity.Success);
  }

  openErrorSnackBar(message: string) {
    this.openSnackBar(message, ToastSeverity.Error);
  }

  private openSnackBar(message: string, status: ToastSeverity) {
    const config: MatSnackBarConfig = {
      duration: 3000,
      horizontalPosition: 'end',
      verticalPosition: 'bottom',
      panelClass: [status],
    };
    this.snackBar.open(message, 'Close', config);
  }
}
