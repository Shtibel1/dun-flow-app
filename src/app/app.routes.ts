import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadChildren: () =>
      import('./features/work-tasks/work-tasks.routes').then((m) => m.WORK_TASKS_ROUTES),
  },
  {
    path: 'auth',
    loadComponent: () =>
      import('./features/auth/components/mock-login/mock-login').then((m) => m.MockLogin),
  }
];
