import { Injectable } from '@angular/core';
import { ActivatedRoute, CanActivate, Router, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';

import { AuthService } from '../../authentication/services/auth.service';

@Injectable({
  providedIn: 'root',
})
export class RoleGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router, private activatedRoute: ActivatedRoute) {}

  canActivate(): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    const userRoles = this.authService.getUserRoles().getValue();
    const isAuthenticated = this.authService.getAuthStatusListener().getValue();
    return isAuthenticated && userRoles && userRoles.includes('ADMIN')
      ? true
      : this.router.navigate([this.activatedRoute.snapshot.url.length ? [this.activatedRoute.snapshot.url] : ['/']]);
  }
}
