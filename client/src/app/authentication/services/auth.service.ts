import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, Subject } from 'rxjs';

import { environment } from '../../../environments/environment';
import { AuthData } from '../interfaces/auth-data.interface';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private token: string | null = null;
  private isAuthenticated = false;
  private authStatusListener = new Subject<boolean>();
  private tokenTimer!: NodeJS.Timer;
  private userId: string | null = '';

  private readonly BACKEND_URL = environment.apiUrl + '/user/';

  constructor(private httpClient: HttpClient, private router: Router) {}

  getToken(): string | null {
    return this.token;
  }

  getIsAuth(): boolean {
    return this.isAuthenticated;
  }

  getUserId() {
    return this.userId;
  }

  getAuthStatusListener(): Observable<boolean> {
    return this.authStatusListener.asObservable();
  }

  createUser(email: string, password: string, username: string): void {
    const authData: AuthData = { email, password, username };
    this.httpClient
      .post<{ accessToken: string; expiresIn: number; user: { id: string } }>(`${this.BACKEND_URL}signup`, authData)
      .subscribe({
        next: response => {
          this.token = response.accessToken;
          if (response.accessToken) {
            this.setAuthorizationInfo(response);
          }
        },
        error: () => this.authStatusListener.next(false),
      });
  }

  login(username: string, password: string): void {
    const authData: Omit<AuthData, 'email'> = { password, username };
    this.httpClient
      .post<{ accessToken: string; expiresIn: number; user: { id: string } }>(`${this.BACKEND_URL}login`, authData)
      .subscribe({
        next: response => {
          this.token = response.accessToken;
          if (response.accessToken) {
            this.setAuthorizationInfo(response);
          }
        },
        error: () => {
          this.authStatusListener.next(false);
        },
      });
  }

  autoAuthUser(): void {
    const authInformation = this.getAuthData();
    if (!authInformation) {
      return;
    }
    const now = new Date();
    const expiresIn = authInformation!.expirationDate.getTime() - now.getTime();
    if (expiresIn > 0 && authInformation?.token) {
      this.token = authInformation.token;
      this.isAuthenticated = true;
      this.userId = authInformation.userId;
      this.setAuthTimer(expiresIn / 1000);
      this.authStatusListener.next(true);
    }
  }

  logout(): void {
    this.token = null;
    this.isAuthenticated = false;
    this.authStatusListener.next(false);
    this.userId = null;
    clearTimeout(this.tokenTimer);
    this.clearAuthData();
    this.router.navigate(['/']);
  }

  private setAuthorizationInfo(response: { accessToken: string; expiresIn: number; user: { id: string } }): void {
    const expiresInDuration = response.expiresIn;
    this.setAuthTimer(expiresInDuration);
    this.isAuthenticated = true;
    this.userId = response.user.id;
    this.authStatusListener.next(true);
    const now = new Date();
    const expirationDate = new Date(now.getTime() + expiresInDuration * 1000);
    this.saveAuthData(response.accessToken, expirationDate, this.userId);
    this.router.navigate(['/']);
  }

  private setAuthTimer(duration: number) {
    this.tokenTimer = setTimeout(() => {
      this.logout();
    }, duration * 1000);
  }

  private saveAuthData(token: string, expirationDate: Date, userId: string): void {
    localStorage.setItem('accessToken', token);
    localStorage.setItem('expiration', expirationDate.toISOString());
    localStorage.setItem('userId', userId);
  }

  private clearAuthData(): void {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('expiration');
    localStorage.removeItem('userId');
  }

  private getAuthData() {
    const token = localStorage.getItem('accessToken');
    const expirationDate = localStorage.getItem('expiration');
    const userId = localStorage.getItem('userId');
    if (!token || !expirationDate) {
      return;
    }

    return {
      token,
      expirationDate: new Date(expirationDate),
      userId,
    };
  }
}
