import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, RouterTestingModule],
      providers: [AuthService],
    });

    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should create', () => {
    expect(service).toBeTruthy();
  });

  describe('createUser', () => {
    it('should call the correct API endpoint with the correct data', () => {
      const email = 'test@test.com';
      const password = 'password';
      const authData = { email, password };

      service.createUser(email, password);

      const req = httpMock.expectOne(`${service['BACKEND_URL']}signup`);
      expect(req.request.method).toEqual('POST');
      expect(req.request.body).toEqual(authData);
      req.flush({});
    });
  });

  describe('login', () => {
    it('should call the correct API endpoint with the correct data', () => {
      const email = 'test@test.com';
      const password = 'password';
      const authData = { email, password };

      service.login(email, password);

      const req = httpMock.expectOne(`${service['BACKEND_URL']}login`);
      expect(req.request.method).toEqual('POST');
      expect(req.request.body).toEqual(authData);
      req.flush({
        token: 'mock_token',
        expiresIn: 3600,
        userId: 'mock_user_id',
      });
    });

    it('should set the correct properties on successful login', () => {
      const email = 'test@test.com';
      const password = 'password';

      service.login(email, password);

      const req = httpMock.expectOne(`${service['BACKEND_URL']}login`);
      req.flush({
        token: 'mock_token',
        expiresIn: 3600,
        userId: 'mock_user_id',
      });

      expect(service.getToken()).toEqual('mock_token');
      expect(service.getIsAuth()).toBeTruthy();
      expect(service.getUserId()).toEqual('mock_user_id');
    });
  });
});
