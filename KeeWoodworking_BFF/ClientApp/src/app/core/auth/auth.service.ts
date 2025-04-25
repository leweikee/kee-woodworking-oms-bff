// src/app/core/auth/auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { map, tap, catchError, switchMap } from 'rxjs/operators';
import { environment } from '../../environment/environment';
import { jwtDecode } from 'jwt-decode';
import { Router } from '@angular/router';
import { User, LoginResponse, DecodedToken, RefreshTokenResponse } from './auth.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private currentUserSubject: BehaviorSubject<User | null>;
  public currentUser$: Observable<User | null>;
  private tokenExpirationTimer: any;

  constructor(private http: HttpClient, private router: Router) {
    const user = this.getStoredUser();
    this.currentUserSubject = new BehaviorSubject<User | null>(user);
    this.currentUser$ = this.currentUserSubject.asObservable();
    
    if (user?.token) {
      if (this.isTokenExpired()) {
        this.refreshToken().subscribe();
      } else {
        this.startTokenTimer();
      }
    }
  }

  // Public methods
  public get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  public get token(): string | null {
    return this.currentUserValue?.token || null;
  }

  login(username: string, password: string): Observable<User> {
    return this.http.post<LoginResponse>(`${environment.apiBaseUrl}/auth/login`, { username, password })
      .pipe(
        switchMap(response => this.handleLoginResponse(response)),
        catchError(error => {
          this.clearUser();
          return throwError(() => this.normalizeError(error));
        })
      );
  }

  logout(): void {
    this.clearUser();
    this.http.post(`${environment.apiBaseUrl}/auth/logout`, {}).subscribe();
    this.router.navigate(['/login']);
  }

  refreshToken(): Observable<User | null> {
    if (!this.token) {
      this.clearUser();
      return of(null);
    }

    return this.http.post<RefreshTokenResponse>(`${environment.apiBaseUrl}/auth/refresh-token`, { token: this.token })
      .pipe(
        switchMap(response => {
          if (response.token) {
            return this.handleLoginResponse({
              token: response.token,
              user: response.user || this.currentUserValue!
            });
          }
          this.clearUser();
          return of(null);
        }),
        catchError(error => {
          this.clearUser();
          return throwError(() => this.normalizeError(error));
        })
      );
  }

  isLoggedIn(): boolean {
    return !!(this.currentUserValue?.token && !this.isTokenExpired());
  }

  isFirstLogin(): boolean {
    return this.currentUserValue?.IS_FIRST_LOGIN === true;
  }

  // Private methods
  private handleLoginResponse(response: LoginResponse): Observable<User> {
    if (!response?.token || !response?.user) {
      throw new Error('Invalid server response');
    }

    const decoded = this.decodeToken(response.token);
    if (!decoded?.exp) {
      throw new Error('Invalid token format');
    }

    const user: User = {
      ...response.user,
      token: response.token,
      userId: this.getUserIdFromToken(decoded),
      exp: decoded.exp
    };

    this.storeUser(user);
    this.startTokenTimer();

    if (user.IS_FIRST_LOGIN) {
      this.router.navigate(['/change-password']);
    }

    return of(user);
  }

  private getStoredUser(): User | null {
    try {
      const user = JSON.parse(localStorage.getItem('currentUser') || 'null');
      return user?.token ? user : null;
    } catch {
      return null;
    }
  }

  private storeUser(user: User): void {
    // Never store password in localStorage
    const { PASSWORD, ...safeUser } = user;
    localStorage.setItem('currentUser', JSON.stringify(safeUser));
    this.currentUserSubject.next(safeUser);
  }

  private clearUser(): void {
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
    this.stopTokenTimer();
  }

  private decodeToken(token: string): DecodedToken {
    try {
      return jwtDecode<DecodedToken>(token);
    } catch {
      throw new Error('Invalid token');
    }
  }

  private getUserIdFromToken(decoded: DecodedToken): number {
    // Standard JWT uses 'sub', but we fallback to 'userId'
    const sub = decoded.sub ? parseInt(decoded.sub.toString()) : null;
    return sub || decoded.userId || 0;
  }

  private isTokenExpired(): boolean {
    const user = this.currentUserValue;
    if (!user?.exp) return true;
    
    // Consider token expired 30 seconds before actual expiry
    const now = Math.floor(Date.now() / 1000);
    return user.exp - 30 < now;
  }

  private startTokenTimer(): void {
    const user = this.currentUserValue;
    if (!user?.exp) return;

    this.stopTokenTimer();
    
    // Set timeout to 1 minute before expiration
    const expiresIn = (user.exp * 1000) - Date.now() - 60000;
    this.tokenExpirationTimer = setTimeout(() => {
      this.refreshToken().subscribe();
    }, expiresIn);
  }

  private stopTokenTimer(): void {
    if (this.tokenExpirationTimer) {
      clearTimeout(this.tokenExpirationTimer);
    }
  }

  private normalizeError(error: any): Error {
    if (error?.error?.message) return new Error(error.error.message);
    if (error?.message) return new Error(error.message);
    return new Error('An unknown error occurred');
  }
}