import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { first, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { AuthService } from '../../core/auth/auth.service';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { PasswordStrengthValidator } from '../../shared/validators/password-strength.validator'; 
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    NzFormModule,
    NzInputModule,
    NzButtonModule,
    NzIconModule,
    NzSpinModule
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit, OnDestroy {
  public loginForm!: FormGroup;
  public loading = false;
  public returnUrl!: string;
  public passwordVisible = false;
  public errorMessage: string | null = null;
  private destroy$ = new Subject<void>();

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private message: NzMessageService
  ) { }

  ngOnInit() {
    this.initForm();
    this.checkReturnUrl();
    this.checkExistingSession();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initForm(): void {
    this.loginForm = this.formBuilder.group({
      username: ['', [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(50)
      ]],
      password: ['', [
        Validators.required,
        Validators.minLength(8),
        PasswordStrengthValidator()
      ]]
    });
  }

  private checkReturnUrl(): void {
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/dashboard';
  }

  private checkExistingSession(): void {
    if (this.authService.isLoggedIn()) {
      this.router.navigate([this.returnUrl]);
    }
  }

  get f() { return this.loginForm.controls; }

  onSubmit(): void {
    if (this.loginForm.invalid || this.loading) {
      this.validateAllFormFields();
      return;
    }

    this.errorMessage = null;
    this.loading = true;

    this.authService.login(this.f['username'].value, this.f['password'].value)
      .pipe(
        first(),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: () => {
          this.message.success('Login successful');
          this.router.navigate([this.returnUrl]);
        },
        error: (error) => {
          this.handleError(error);
          this.loading = false;
        }
      });
  }

  private validateAllFormFields(): void {
    Object.values(this.loginForm.controls).forEach(control => {
      if (control.invalid) {
        control.markAsDirty();
        control.updateValueAndValidity({ onlySelf: true });
      }
    });
  }

  private handleError(error: any): void {
    let errorMsg = 'Login failed. Please try again.';
    
    if (error.error?.message) {
      errorMsg = error.error.message;
    } else if (error.status === 0) {
      errorMsg = 'Unable to connect to server. Please check your connection.';
    } else if (error.status === 401) {
      errorMsg = 'Invalid username or password';
    } else if (error.status === 403) {
      errorMsg = 'Account disabled. Please contact administrator.';
    }

    this.errorMessage = errorMsg;
    this.message.error(errorMsg);
  }

  togglePasswordVisibility(): void {
    this.passwordVisible = !this.passwordVisible;
  }
}