import { Component, OnInit } from '@angular/core';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';

import { AuthService } from '../authentication/services/auth.service';

@UntilDestroy()
@Component({
  selector: 'mean-header',
  templateUrl: 'header.component.html',
  styleUrls: ['header.component.scss'],
})
export class HeaderComponent implements OnInit {
  userAuthenticated = false;

  constructor(private authService: AuthService) {}

  ngOnInit() {
    this.authService
      .getAuthStatusListener()
      .pipe(untilDestroyed(this))
      .subscribe(isAuthenticated => {
        this.userAuthenticated = isAuthenticated;
      });
  }

  onLogout() {
    this.authService.logout();
  }
}
