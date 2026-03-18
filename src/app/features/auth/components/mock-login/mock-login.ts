import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input, OnChanges, OnInit, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { User } from '../../../../core/models/user';
import { AuthService } from '../../../../core/services/auth-service';
import { Router } from '@angular/router';
import { UsersService } from '../../../../core/services/users-service';
import { Select } from '../../../../shared/ui/select/select';
import { Option } from '../../../../core/models/option';

@Component({
  selector: 'app-mock-login',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatSelectModule,
    MatButtonModule,
    Select,
  ],
  templateUrl: './mock-login.html',
  styleUrl: './mock-login.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MockLogin implements OnInit {
  users: User[] = [];
  usersOptions: Option<User>[] = [];
  isLoading = false;
  errorMessage = '';

  loginForm: FormGroup = new FormGroup({});
  userControl: FormControl<User | null> = new FormControl(null, Validators.required);

  private authService = inject(AuthService);
  private router = inject(Router);
  private usersService = inject(UsersService);

  ngOnInit(): void {
    if (this.authService.currentUser$.value) {
      this.router.navigate(['/']);
    }

    this.initForm();
    this.initUsers();
  }

  initForm(): void {
    this.loginForm = new FormGroup({
      userId: this.userControl,
    });
  }

  initUsers() {
    this.isLoading = true;
    this.usersService.getUsers().subscribe((users) => {
      this.users = users;
      this.usersOptions = users.map((user) => ({
        label: user.fullName,
        value: user,
      }));
      this.isLoading = false;
    });
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      return;
    }

    this.authService.login(this.userControl.value);
  }
}
