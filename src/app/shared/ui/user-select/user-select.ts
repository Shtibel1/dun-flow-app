import { ChangeDetectionStrategy, Component, DestroyRef, Input, OnInit, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl } from '@angular/forms';
import { Option } from '../../../core/models/option';
import { UsersService } from '../../../core/services/users-service';
import { Select } from '../select/select';

@Component({
  selector: 'app-user-select',
  imports: [Select],
  templateUrl: './user-select.html',
  styleUrl: './user-select.scss',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserSelect implements OnInit {
  @Input() label = 'User';
  @Input({ required: true }) control!: FormControl<number | null>;

  private readonly usersService = inject(UsersService);
  private readonly destroyRef = inject(DestroyRef);

  userOptions = signal<Option<number>[]>([]);

  ngOnInit(): void {
    this.usersService.getUsers()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((users) =>
        this.userOptions.set(users.map((u) => ({ value: u.id, label: u.fullName }))),
      );
  }
}
