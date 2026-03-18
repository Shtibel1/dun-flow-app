import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, catchError, map, switchMap, tap, throwError } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { AuthService } from '../../../core/services/auth-service';
import { ChangeStatusRequest, CreateTaskRequest } from '../models/task-requests';
import { WorkTask, WorkTaskDetails } from '../models/work-task';

@Injectable()
export class TasksService {
  private readonly baseUrl = `${environment.baseUrl}/api/worktasks`;

  private readonly userTasksSubject = new BehaviorSubject<WorkTask[]>([]);
  readonly userTasks$ = this.userTasksSubject.asObservable();

  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);

  getUserTasks(): Observable<WorkTask[]> {
    const userId = this.authService.currentUser$.value?.id;

    return this.http.get<WorkTask[]>(`${this.baseUrl}/user/${userId}`).pipe(
      tap((tasks) => this.userTasksSubject.next(tasks))
    );
  }

  getTask(taskId: number): Observable<WorkTaskDetails> {
    return this.http.get<WorkTaskDetails>(`${this.baseUrl}/${taskId}`);
  }

  createTask(request: CreateTaskRequest): Observable<number | null> {
    return this.http.post<{ taskId?: number }>(this.baseUrl, request).pipe(
      map((response) => response?.taskId ?? null),
      switchMap((taskId) => this.getUserTasks().pipe(map(() => taskId)))
    );
  }

  changeStatus(taskId: number, request: ChangeStatusRequest): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/${taskId}/status`, request);
  }

  closeTask(taskId: number): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/${taskId}/close`, {});
  }
}