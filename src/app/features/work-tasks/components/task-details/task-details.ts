import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { filter, finalize, Observable, switchMap, tap } from 'rxjs';
import { Option } from '../../../../core/models/option';
import { AuthService } from '../../../../core/services/auth-service';
import { FormField } from '../../models/form-field';
import { ChangeStatusRequest, CreateTaskRequest } from '../../models/task-requests';
import { TaskType } from '../../models/task-type';
import { WorkTaskDetails } from '../../models/work-task';
import { TaskMetadataService } from '../../services/task-metadata-service';
import { TasksService } from '../../services/tasks-service';

import { of } from 'rxjs';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CustomInput } from '../../../../shared/ui/custom-input/custom-input';
import { Select } from '../../../../shared/ui/select/select';
import { UserSelect } from '../../../../shared/ui/user-select/user-select';
import { DynamicTaskForm } from '../dynamic-task-form/dynamic-task-form';
import { TaskStatusStepper } from '../task-status-stepper/task-status-stepper';

interface TaskFormModel {
  title: FormControl<string | null>;
  type: FormControl<number | null>;
  currentStatus: FormControl<number | null>;
  nextAssignedUserId: FormControl<number | null>;
  customFields: FormGroup<Record<string, FormControl<any>>>;
}

@Component({
  selector: 'app-task-details',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    CustomInput,
    Select,
    DynamicTaskForm,
    UserSelect,
    TaskStatusStepper,
  ],
  templateUrl: './task-details.html',
  styleUrl: './task-details.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TaskDetails implements OnInit {
  private destroyRef = inject(DestroyRef);
  private tasksService = inject(TasksService);
  private taskMetadataService = inject(TaskMetadataService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private authService = inject(AuthService);
  private snackBar = inject(MatSnackBar);

  task = signal<WorkTaskDetails | null>(null);
  isEditMode = signal(false);
  dynamicFields = signal<FormField[]>([]);
  isLoading = signal(false);
  errorMessage = signal('');
  taskType = signal<TaskType | null>(null);
  taskTypeOptions = signal<Option<number>[]>([]);
  taskStatusOptions = signal<Option<number>[]>([]);

  isClosed = computed(() => this.task()?.isClosed ?? false);

  steps = computed(() => {
    const type = this.taskType();
    return (
      type?.statuses.map((status) => ({
        value: status.statusValue,
        label: status.displayName,
      })) ?? []
    );
  });

  currentStepIndex = signal<number>(-1);

  canGoForward = computed(
    () => this.currentStepIndex() >= 0 && this.currentStepIndex() < this.steps().length - 1,
  );

  canGoBackward = computed(() => this.currentStepIndex() > 0);

  form!: FormGroup<TaskFormModel>;

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    const taskId = idParam ? Number(idParam) : null;

    this.isLoading.set(true);

    this.initTaskTypeOptions()
      .pipe(
        switchMap(() => {
          if (taskId) {
            return this.initTask(taskId).pipe(
              switchMap((task) => this.initTaskType(task.workTaskTypeId)),
            );
          }
          return of(null);
        }),
        finalize(() => this.isLoading.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: () => {
          this.initForm();
          this.initStatusListener();
        },
        error: (error: Error) => {
          this.errorMessage.set(error.message);
        },
      });
  }

  private initForm(): void {
    const title = this.task()?.title ?? '';
    const type = this.task()?.workTaskTypeId ?? null;
    const currentStatusValue = this.task()?.currentStatus ?? null;
    const currentStepIndex =
      currentStatusValue != null
        ? this.steps().findIndex((s) => s.value === currentStatusValue)
        : null;
    const nextAssignedUserId = this.task()?.assignedUserId ?? null;

    this.form = new FormGroup({
      title: new FormControl<string | null>(title, [Validators.required]),
      type: new FormControl<number | null>({ disabled: this.isEditMode(), value: type }, [
        Validators.required,
      ]),
      currentStatus: new FormControl<number | null>(
        currentStepIndex != null && currentStepIndex >= 0 ? currentStepIndex : null,
      ),
      nextAssignedUserId: new FormControl<number | null>(nextAssignedUserId, [Validators.required]),
      customFields: new FormGroup<Record<string, FormControl<any>>>({}),
    });

    this.currentStepIndex.set(
      currentStepIndex != null && currentStepIndex >= 0 ? currentStepIndex : -1,
    );

    if (this.isClosed()) {
      this.form.disable();
    }
  }

  private initTaskType(typeId: number): Observable<TaskType | null> {
    return this.taskMetadataService.getTaskType(typeId).pipe(
      tap({
        next: (type) => {
          if (!type) return;
          this.taskType.set(type);
          this.taskStatusOptions.set(
            type.statuses.map((status) => ({
              value: status.statusValue,
              label: status.displayName,
            })),
          );
        },
        error: () => this.taskType.set(null),
      }),
    );
  }

  private initTaskTypeOptions(): Observable<TaskType[]> {
    return this.taskMetadataService.getTaskTypes().pipe(
      tap({
        next: (types) => {
          this.taskTypeOptions.set(
            types.map((type) => ({
              value: type.typeValue,
              label: type.taskType,
            })),
          );
        },
        error: () => this.taskTypeOptions.set([]),
      }),
    );
  }

  private initStatusListener(): void {
    this.form.controls.currentStatus.valueChanges
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        filter((val): val is number => val != null),
      )
      .subscribe((val) => {
        this.currentStepIndex.set(val);
        this.loadSchemaForSelectedStatus();
      });

    const initialStatus = this.form.controls.currentStatus.value;
    if (initialStatus != null) {
      this.loadSchemaForSelectedStatus();
    }
  }

  goToTasksList(): void {
    this.router.navigate(['/']);
  }

  closeTask(): void {
    const task = this.task();
    if (!task) return;

    this.isLoading.set(true);
    this.errorMessage.set('');

    this.tasksService
      .closeTask(task.id)
      .pipe(
        finalize(() => this.isLoading.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: () => {
          this.showSuccess('Task closed successfully.');
          this.goToTasksList();
        },
        error: (error: Error) => {
          this.errorMessage.set(error.message);
        },
      });
  }

  private initTask(id: number): Observable<WorkTaskDetails> {
    this.isEditMode.set(true);
    this.errorMessage.set('');

    return this.tasksService.getTask(id).pipe(
      tap({
        next: (task) => {
          this.task.set(task);
          const stepIndex = this.steps().findIndex((s) => s.value === task.currentStatus);
          const newIndex = stepIndex >= 0 ? stepIndex : -1;
          this.form?.controls.currentStatus.setValue(newIndex >= 0 ? newIndex : null);
          this.currentStepIndex.set(newIndex);
        },
        error: (error: Error) => {
          this.task.set(null);
          this.errorMessage.set(error.message);
        },
      }),
    );
  }

  private loadSchemaForSelectedStatus(): void {
    const task = this.task();
    if (!task) return;
    const stepIndex = this.form.controls.currentStatus.value;
    if (stepIndex == null || stepIndex < 0) return;
    const nextStatusValue = this.steps()[stepIndex + 1]?.value;
    if (nextStatusValue == null) {
      this.dynamicFields.set([]);
      return;
    }
    this.taskMetadataService
      .getFormSchema(task.workTaskTypeId, nextStatusValue)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (fields) => this.dynamicFields.set(fields),
        error: (error: Error) => {
          this.dynamicFields.set([]);
          this.errorMessage.set(error.message);
        },
      });
  }

  submitCreate(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const title = this.form.controls.title.value;
    const type = this.form.controls.type.value;
    const assignedUserId = this.form.controls.nextAssignedUserId.value;

    if (!type || !assignedUserId || !title) return;

    const request: CreateTaskRequest = {
      title,
      WorkTaskTypeId: type,
      assignedUserId,
    };

    this.isLoading.set(true);
    this.tasksService
      .createTask(request)
      .pipe(
        finalize(() => this.isLoading.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: () => {
          this.showSuccess('Task created successfully.');
          this.goToTasksList();
        },
        error: (error: Error) => this.errorMessage.set(error.message),
      });
  }

  private submitUpdate(targetStepIndex?: number): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const task = this.task();
    const stepIndex = targetStepIndex ?? this.form.controls.currentStatus.value;
    const targetStatus = stepIndex != null ? this.steps()[stepIndex]?.value : null;
    const nextAssignedUserId = this.form.controls.nextAssignedUserId.value;

    if (!task || targetStatus == null || !nextAssignedUserId) return;

    const request: ChangeStatusRequest = {
      targetStatus,

      nextAssignedUserId,
      customFieldsJson: JSON.stringify(this.form.controls.customFields.getRawValue()),
    };

    this.isLoading.set(true);
    this.tasksService
      .changeStatus(task.id, request)
      .pipe(
        finalize(() => this.isLoading.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: () => {
          this.showSuccess('Task updated successfully.');

          const currentUserId = this.authService.currentUser$.value?.id;
          const wasTransferredToAnotherUser =
            currentUserId != null && nextAssignedUserId !== currentUserId;

          if (wasTransferredToAnotherUser) {
            this.router.navigate(['/']);
            return;
          }

          this.initTask(task.id)
            .pipe(switchMap((updatedTask) => this.initTaskType(updatedTask.workTaskTypeId)))
            .subscribe();
        },
        error: (error: Error) => this.errorMessage.set(error.message),
      });
  }

  goForward(): void {
    const nextIndex = this.currentStepIndex() + 1;
    if (nextIndex >= this.steps().length) return;

    this.submitUpdate(nextIndex);
  }

  goBackward(): void {
    const prevIndex = this.currentStepIndex() - 1;
    if (prevIndex < 0) return;
    this.form.controls.currentStatus.setValue(prevIndex);
  }

  private showSuccess(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 2500,
      horizontalPosition: 'end',
      verticalPosition: 'top',
    });
  }
}

interface TaskFormModel {
  title: FormControl<string | null>;
  type: FormControl<number | null>;
  currentStatus: FormControl<number | null>;
  nextAssignedUserId: FormControl<number | null>;
  customFields: FormGroup<Record<string, FormControl<any>>>;
}
