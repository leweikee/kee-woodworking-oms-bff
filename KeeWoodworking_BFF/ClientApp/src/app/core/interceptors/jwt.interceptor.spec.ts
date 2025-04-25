// src/app/core/interceptors/jwt.interceptor.spec.ts
import { TestBed } from '@angular/core/testing';
import { HttpRequest, HttpHandler, HTTP_INTERCEPTORS } from '@angular/common/http';
import { JwtInterceptor } from './jwt.interceptor';
import { AuthService } from '../auth/auth.service';

describe('JwtInterceptor', () => {
  let interceptor: JwtInterceptor;
  let authService: jasmine.SpyObj<AuthService>;

  beforeEach(() => {
    // Create spy for the getter method instead of the property
    const authServiceSpy = jasmine.createSpyObj('AuthService', [], {
      // Use getter for currentUserValue
      get currentUserValue() { return null; }
    });
    
    TestBed.configureTestingModule({
      providers: [
        JwtInterceptor,
        { provide: AuthService, useValue: authServiceSpy }
      ]
    });
    
    interceptor = TestBed.inject(JwtInterceptor);
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
  });

  it('should be created', () => {
    expect(interceptor).toBeTruthy();
  });
  
  it('should add an Authorization header when a user is logged in', () => {
    // Setup mock user with token
    const mockUser = { jwToken: 'fake-jwt-token' };
    
    // Override the getter spy to return our mock user
    Object.defineProperty(authService, 'currentUserValue', {
      get: () => mockUser
    });
    
    // Create request and next handler
    const request = new HttpRequest('GET', '/api/test');
    const next = jasmine.createSpyObj('HttpHandler', ['handle']);
    
    // Call the interceptor
    interceptor.intercept(request, next);
    
    // Verify next.handle was called with a request containing the auth header
    expect(next.handle).toHaveBeenCalled();
    const modifiedRequest = next.handle.calls.mostRecent().args[0];
    expect(modifiedRequest.headers.get('Authorization')).toBe('Bearer fake-jwt-token');
  });
  
  it('should not add an Authorization header when no user is logged in', () => {
    // Override the getter spy to return null
    Object.defineProperty(authService, 'currentUserValue', {
      get: () => null
    });
    
    // Create request and next handler
    const request = new HttpRequest('GET', '/api/test');
    const next = jasmine.createSpyObj('HttpHandler', ['handle']);
    
    // Call the interceptor
    interceptor.intercept(request, next);
    
    // Verify the request was passed through unchanged
    expect(next.handle).toHaveBeenCalledWith(request);
  });
});