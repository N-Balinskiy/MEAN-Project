import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';

import { AuthService } from '../services/auth.service';

@UntilDestroy()
@Component({
  templateUrl: 'login.component.html',
  styleUrls: ['login.component.scss'],
})
export class LoginComponent implements OnInit {
  isLoading = false;
  form: Nullable<FormGroup> = null;

  constructor(private authService: AuthService) {}

  ngOnInit() {
    this.initFormGroup();
    this.authService
      .getAuthStatusListener()
      .pipe(untilDestroyed(this))
      .subscribe(() => {
        this.isLoading = false;
      });
  }

  onLogin(): void {
    if (this.form?.invalid) {
      return;
    }

    this.isLoading = true;
    this.authService.login(this.form?.value.username, this.form?.value.password);
  }

  private initFormGroup(): void {
    this.form = new FormGroup({
      username: new FormControl(null, { validators: [Validators.required] }),
      password: new FormControl(null, { validators: [Validators.required] }),
    });
  }
}
