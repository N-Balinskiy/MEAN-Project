import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { BehaviorSubject, Observable, switchMap, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { ErrorComponent } from '../../shared/components/error/error.component';
import { SnackBarService } from '../../shared/services/snackbar.service';
import { AuthResponse } from '../interfaces/auth-response.interface';
import { AuthService } from '../services/auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private isRefreshing = false;
  private refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);

  constructor(private dialog: MatDialog, private authService: AuthService, private snackbar: SnackBarService) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    request = this.addAuthorizationHeader(request);

    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          return this.handle401Error(request, next);
        } else if (error.status === 404 && error.error.message === 'User not found!') {
          this.authService.logout();
          this.dialog.open(ErrorComponent, { data: { message: 'Your account was deleted' } });
          return throwError(() => error);
        } else {
          let errorMessage = error.error.message || 'An unknown error occurred!';
          this.snackbar.openErrorSnackBar(errorMessage);
          return throwError(() => error);
        }
      })
    );
  }

  private addAuthorizationHeader(request: HttpRequest<any>): HttpRequest<any> {
    const accessToken = this.authService.getToken().getValue();

    if (accessToken) {
      return request.clone({
        setHeaders: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
    }

    return request;
  }

  private handle401Error(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (!this.isRefreshing) {
      this.isRefreshing = true;
      this.refreshTokenSubject.next(null);

      return this.authService.refreshToken().pipe(
        switchMap((response: AuthResponse) => {
          this.isRefreshing = false;
          this.refreshTokenSubject.next(response.accessToken);
          return next.handle(this.addAuthorizationHeader(request));
        }),
        catchError(error => {
          this.authService.logout();
          return throwError(error);
        })
      );
    } else {
      return this.refreshTokenSubject.pipe(
        switchMap(accessToken => {
          if (accessToken) {
            return next.handle(this.addAuthorizationHeader(request));
          } else {
            this.authService.logout();
            this.dialog.open(ErrorComponent, { data: { message: 'Session expired' } });
            return throwError(() => 'Session expired');
          }
        })
      );
    }
  }
}
