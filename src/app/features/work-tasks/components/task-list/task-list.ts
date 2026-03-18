import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TableComponent } from '../../../../shared/ui/table/table';
import { WorkTask } from '../../models/work-task';
import { TasksService } from '../../services/tasks-service';
import { TasksConfig } from './tasks.config';

@Component({
  selector: 'app-task-list',
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTableModule,
    TableComponent,
  ],
  templateUrl: './task-list.html',
  styleUrl: './task-list.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TaskList implements OnInit {
  private readonly destroyRef = inject(DestroyRef);

  tasks = signal<WorkTask[]>([]);
  isLoading = signal(false);
  errorMessage = signal('');

  dataSource = signal<MatTableDataSource<WorkTask> | null>(null);
  columnConfig = TasksConfig;

  private readonly tasksService = inject(TasksService);
  private readonly router = inject(Router);

  ngOnInit(): void {
    this.initTasks();
  }

  onRow(t: WorkTask) {
    this.router.navigate(['tasks', 'manage', t.id]);
  }

  onCreate(): void {
    this.router.navigate(['tasks', 'create']);
  }

  initTasks(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');

    this.tasksService.getUserTasks()
      .pipe(
        finalize(() => this.isLoading.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
      next: (tasks) => {
        this.tasks.set(tasks);
        this.dataSource.set(new MatTableDataSource(tasks));
      },
      error: () => {
        this.errorMessage.set('Failed to load tasks.');
      },
    });
  }
}
