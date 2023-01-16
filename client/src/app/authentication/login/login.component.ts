import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { Subscription } from 'rxjs';

@Component({
  templateUrl: 'login.component.html',
  styleUrls: ['login.component.scss']
})
export class LoginComponent implements OnInit, OnDestroy {
  isLoading = false;
  form: Nullable<FormGroup> = null;

  private authStatusSub!: Subscription;

  constructor(private authService: AuthService) {
  }

  ngOnInit() {
    this.initFormGroup();
    this.authStatusSub = this.authService.getAuthStatusListener().subscribe(
      authStatus => {
        this.isLoading = false;
      }
    );
  }

  ngOnDestroy(): void {
    this.authStatusSub.unsubscribe();
  }

  onLogin(): void {
    if (this.form?.invalid) {
      return;
    }

    this.isLoading = true;
    this.authService.login(this.form?.value.email, this.form?.value.password)
  }

  private initFormGroup(): void {
    this.form = new FormGroup({
      email: new FormControl(null, { validators: [Validators.required, Validators.email] }),
      password: new FormControl(null, { validators: [Validators.required] }),
    });
  }
}
