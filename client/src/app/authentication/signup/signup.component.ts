import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';

import { AuthService } from '../services/auth.service';

@UntilDestroy()
@Component({
  templateUrl: 'signup.component.html',
  styleUrls: ['signup.component.scss'],
})
export class SignupComponent implements OnInit {
  isLoading = false;
  form: Nullable<FormGroup> = null;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.initFormGroup();
    this.authService
      .getAuthStatusListener()
      .pipe(untilDestroyed(this))
      .subscribe(() => {
        this.isLoading = false;
      });
  }

  onSignup(): void {
    if (this.form?.invalid) {
      return;
    }

    this.isLoading = true;
    this.authService.createUser(this.form?.value.email, this.form?.value.password, this.form?.value.username);
  }

  private initFormGroup(): void {
    this.form = new FormGroup({
      email: new FormControl(null, { validators: [Validators.required, Validators.email] }),
      password: new FormControl(null, { validators: [Validators.required] }),
      username: new FormControl(null, { validators: [Validators.required] }),
    });
  }
}
