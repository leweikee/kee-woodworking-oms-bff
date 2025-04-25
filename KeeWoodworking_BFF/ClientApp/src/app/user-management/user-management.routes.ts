import { Routes } from '@angular/router';
import { UserListingComponent } from './user-listing/user-listing.component';
import { UserFormComponent } from './user-form/user-form.component';
import { PasswordFormComponent } from './password-form/password-form.component';

export const userManagementRoutes: Routes = [
  { path: '', component: UserListingComponent },
  { path: 'add', component: UserFormComponent },
  { path: 'edit/:id', component: UserFormComponent },
  { path: 'set-password/:id', component: PasswordFormComponent }
];