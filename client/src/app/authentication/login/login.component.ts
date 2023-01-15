import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../services/auth.service';

@Component({
  templateUrl: 'login.component.html',
  styleUrls: ['login.component.scss']
})
export class LoginComponent implements OnInit {
  isLoading = false;
  form: Nullable<FormGroup> = null;

  constructor(private authService: AuthService) {
  }

  ngOnInit() {
    this.initFormGroup();
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
