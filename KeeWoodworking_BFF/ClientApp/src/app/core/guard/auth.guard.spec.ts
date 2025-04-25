// src/app/core/guard/auth.guard.spec.ts
import { TestBed } from '@angular/core/testing';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { AuthGuard } from './auth.guard';

describe('authGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) =>
    TestBed.runInInjectionContext(() => AuthGuard(...guardParameters));
  
  let authService: jasmine.SpyObj<AuthService>;
  let router: jasmine.SpyObj<Router>;

  beforeEach(() => {
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['isLoggedIn']);
    const routerSpy = jasmine.createSpyObj('Router', ['createUrlTree']);
    
    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy }
      ]
    });
    
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
  
  it('should allow access when user is logged in', () => {
    authService.isLoggedIn.and.returnValue(true);
    const result = executeGuard({} as any, {} as any);
    expect(result).toBeTrue();
  });
  
  it('should redirect to login when user is not logged in', () => {
    authService.isLoggedIn.and.returnValue(false);
    router.createUrlTree.and.returnValue({} as any);
    
    executeGuard({} as any, { url: '/protected' } as any);
    
    expect(router.createUrlTree).toHaveBeenCalledWith(
      ['/login'], 
      { queryParams: { returnUrl: '/protected' }}
    );
  });
});