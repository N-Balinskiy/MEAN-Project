import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';

import { AuthService } from '../services/auth.service';

@Component({
  templateUrl: 'login.component.html',
  styleUrls: ['login.component.scss'],
})
export class LoginComponent implements OnInit, OnDestroy {
  isLoading = false;
  form: Nullable<FormGroup> = null;

  private authStatusSub: Subscription = new Subscription();

  constructor(private authService: AuthService) {}

  ngOnInit() {
    this.initFormGroup();
    this.authStatusSub = this.authService.getAuthStatusListener().subscribe(() => {
      this.isLoading = false;
    });
  }

  ngOnDestroy(): void {
    this.authStatusSub.unsubscribe();
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
