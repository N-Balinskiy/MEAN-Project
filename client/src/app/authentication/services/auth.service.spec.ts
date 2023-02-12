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
      const username = 'username';
      const authData = { email, password, username };

      service.createUser(email, password, username);

      const req = httpMock.expectOne(`${service['BACKEND_URL']}signup`);
      expect(req.request.method).toEqual('POST');
      expect(req.request.body).toEqual(authData);
      req.flush({});
    });
  });

  describe('login', () => {
    it('should call the correct API endpoint with the correct data', () => {
      const username = 'username';
      const password = 'password';
      const authData = { username, password };

      service.login(username, password);

      const req = httpMock.expectOne(`${service['BACKEND_URL']}login`);
      expect(req.request.method).toEqual('POST');
      expect(req.request.body).toEqual(authData);
      req.flush({
        accessToken: 'mock_token',
        expiresIn: 3600,
        user: { id: 'mock_user_id' },
      });
    });

    it('should set the correct properties on successful login', () => {
      const username = 'username';
      const password = 'password';

      service.login(username, password);

      const req = httpMock.expectOne(`${service['BACKEND_URL']}login`);
      req.flush({
        accessToken: 'mock_token',
        expiresIn: 3600,
        user: { id: 'mock_user_id' },
      });

      expect(service.getToken()).toEqual('mock_token');
      expect(service.getIsAuth()).toBeTruthy();
      expect(service.getUserId()).toEqual('mock_user_id');
    });
  });
});
