import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject, Observable, tap } from 'rxjs';

import { environment } from '../../../environments/environment';
import { PageLinks } from '../../shared/enums/page-links.enum';
import { AuthData } from '../interfaces/auth-data.interface';
import { AuthResponse } from '../interfaces/auth-response.interface';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private token: BehaviorSubject<string | null> = new BehaviorSubject<string | null>(null);
  private authStatusListener = new BehaviorSubject<boolean>(false);
  private userId: BehaviorSubject<string | null> = new BehaviorSubject<string | null>(null);
  private userRoles: BehaviorSubject<string[]> = new BehaviorSubject<string[]>([]);

  private readonly BACKEND_URL = environment.apiUrl + '/user/';

  constructor(private httpClient: HttpClient, private router: Router, private activatedRoute: ActivatedRoute) {}

  getToken(): BehaviorSubject<string | null> {
    return this.token;
  }

  getUserId() {
    return this.userId;
  }

  getUserRoles() {
    return this.userRoles;
  }

  getAuthStatusListener(): BehaviorSubject<boolean> {
    return this.authStatusListener;
  }

  createUser(email: string, password: string, username: string): void {
    const authData: AuthData = { email, password, username };
    this.httpClient.post<AuthResponse>(`${this.BACKEND_URL}signup`, authData, { withCredentials: true }).subscribe({
      next: response => {
        this.token.next(response.accessToken);
        if (response.accessToken) {
          this.setAuthorizationInfo(response);
        }
      },
      error: () => this.authStatusListener.next(false),
    });
  }

  login(username: string, password: string): void {
    const authData: Omit<AuthData, 'email'> = { password, username };
    this.httpClient.post<AuthResponse>(`${this.BACKEND_URL}login`, authData, { withCredentials: true }).subscribe({
      next: response => {
        this.token.next(response.accessToken);
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
    if (authInformation?.token) {
      this.token.next(authInformation.token);
      this.userId.next(authInformation.userId);
      this.userRoles.next(authInformation.userRoles);
      this.authStatusListener.next(true);
    }
  }

  logout(): void {
    this.httpClient.get<void>(`${this.BACKEND_URL}logout`, { withCredentials: true }).subscribe(() => {
      this.token.next(null);
      this.authStatusListener.next(false);
      this.userId.next(null);
      this.userRoles.next([]);
      this.clearAuthData();
      this.router.navigate([PageLinks.PostsList]);
    });
  }

  refreshToken(): Observable<AuthResponse> {
    return this.httpClient.get<AuthResponse>(`${this.BACKEND_URL}refresh`, { withCredentials: true }).pipe(
      tap((response: AuthResponse) => {
        if (response.accessToken) {
          this.token.next(response.accessToken);
          this.setAuthorizationInfo(response);
        }
      })
    );
  }

  setAuthorizationInfo(response: AuthResponse): void {
    this.userId.next(response.user.id);
    this.userRoles.next(response.user.roles);
    this.authStatusListener.next(true);
    this.saveAuthData(response.accessToken, this.userId?.getValue() ?? '', this.userRoles?.getValue() ?? []);
    this.router.navigate(
      this.activatedRoute.snapshot.url.length ? [this.activatedRoute.snapshot.url] : [PageLinks.PostsList]
    );
  }

  private saveAuthData(token: string, userId: string, userRoles: string[]): void {
    localStorage.setItem('accessToken', token);
    localStorage.setItem('userId', userId);
    localStorage.setItem('userRoles', JSON.stringify(userRoles));
  }

  private clearAuthData(): void {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('userId');
    localStorage.removeItem('userRoles');
  }

  private getAuthData() {
    const token = localStorage.getItem('accessToken');
    const userId = localStorage.getItem('userId');
    const userRolesString = localStorage.getItem('userRoles');
    const userRoles = userRolesString ? JSON.parse(userRolesString) : null;

    if (!token) {
      return;
    }

    return {
      token,
      userId,
      userRoles,
    };
  }
}
