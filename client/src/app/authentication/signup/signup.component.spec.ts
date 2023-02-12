import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Observable } from 'rxjs';

import { AuthService } from '../services/auth.service';
import { SignupComponent } from './signup.component';

describe('SignupComponent', () => {
  let component: SignupComponent;
  let fixture: ComponentFixture<SignupComponent>;
  let authService: AuthService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, HttpClientModule],
      declarations: [SignupComponent],
      providers: [AuthService],
    });

    fixture = TestBed.createComponent(SignupComponent);
    component = fixture.componentInstance;
    authService = TestBed.inject(AuthService);
    spyOn(authService, 'createUser').and.returnValue();
    spyOn(authService, 'getAuthStatusListener').and.returnValue(new Observable());
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize the form group', () => {
    fixture.detectChanges();
    expect(component.form).toBeTruthy();
  });

  it('should call the createUser method on signup', () => {
    fixture.detectChanges();
    component.form?.controls['email'].setValue('email@example.com');
    component.form?.controls['password'].setValue('password');
    component.form?.controls['username'].setValue('username');
    component.onSignup();
    expect(authService.createUser).toHaveBeenCalledWith('email@example.com', 'password', 'username');
  });

  it('should not call the createUser method on signup if the form is invalid', () => {
    fixture.detectChanges();
    component.form?.controls['email'].setValue('');
    component.form?.controls['password'].setValue('password');
    component.form?.controls['password'].setValue('username');
    component.onSignup();
    expect(authService.createUser).not.toHaveBeenCalled();
  });
});
