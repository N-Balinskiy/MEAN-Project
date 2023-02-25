import { HttpClientModule } from '@angular/common/http';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject } from 'rxjs';

import { AuthService } from '../services/auth.service';
import { LoginComponent } from './login.component';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authService: AuthService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, NoopAnimationsModule, HttpClientModule],
      declarations: [LoginComponent],
      providers: [
        AuthService,
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: { url: '/', params: { id: 'test-id' } },
          },
        },
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    authService = TestBed.get(AuthService);
    spyOn(authService, 'login').and.returnValue();
    spyOn(authService, 'getAuthStatusListener').and.returnValue(new BehaviorSubject(false));
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call the login method with correct arguments when form is valid and submit button is clicked', () => {
    const usernameInput = fixture.debugElement.query(By.css('input[formControlName="username"]'));
    const passwordInput = fixture.debugElement.query(By.css('input[formControlName="password"]'));
    const submitButton = fixture.debugElement.query(By.css('button[type="submit"]'));

    usernameInput.nativeElement.value = 'username';
    usernameInput.nativeElement.dispatchEvent(new Event('input'));
    passwordInput.nativeElement.value = 'password';
    passwordInput.nativeElement.dispatchEvent(new Event('input'));

    submitButton.nativeElement.click();

    expect(authService.login).toHaveBeenCalledWith('username', 'password');
  });

  it('should not call the login method when form is invalid and submit button is clicked', () => {
    const submitButton = fixture.debugElement.query(By.css('button[type="submit"]'));
    submitButton.nativeElement.click();

    expect(authService.login).not.toHaveBeenCalled();
  });
});
