import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { User } from '../../authentication/interfaces/user.interface';

@Injectable({ providedIn: 'root' })
export class UsersService {
  private readonly BACKEND_URL = environment.apiUrl + '/user/';

  constructor(private httpClient: HttpClient) {}

  getUsers(): Observable<User[]> {
    return this.httpClient.get<User[]>(this.BACKEND_URL + 'users');
  }

  banUser(userId: string): Observable<void> {
    return this.httpClient.put<void>(this.BACKEND_URL + 'ban', { id: userId });
  }

  deleteUser(userId: string): Observable<void> {
    return this.httpClient.delete<void>(this.BACKEND_URL + 'delete/' + userId);
  }
}
