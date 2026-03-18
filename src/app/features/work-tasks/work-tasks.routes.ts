import { Routes } from '@angular/router';
import { authGuard } from '../../core/guards/auth';
import { TaskMetadataService } from './services/task-metadata-service';
import { TasksService } from './services/tasks-service';

export const WORK_TASKS_ROUTES: Routes = [
  {
    path: '',
    canActivate: [authGuard],
    providers: [TasksService, TaskMetadataService],
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./components/task-list/task-list').then((m) => m.TaskList),
      },
      {
        path: 'tasks/create',
        loadComponent: () =>
          import('./components/task-details/task-details').then((m) => m.TaskDetails),
        data: { mode: 'create' },
      },
      {
        path: 'tasks/manage/:id',
        loadComponent: () =>
          import('./components/task-details/task-details').then((m) => m.TaskDetails),
        data: { mode: 'edit' },
      },
    ],
  },
];
