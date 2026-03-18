import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import {
  BehaviorSubject,
  map,
  Observable,
  of,
  tap
} from 'rxjs';
import { environment } from '../../../../environments/environment';
import { FormField } from '../models/form-field';
import { TaskType } from '../models/task-type';

@Injectable()
export class TaskMetadataService {
  private readonly baseUrl = `${environment.baseUrl}/api/WorkTaskMetadata`;

  private readonly taskTypeMetadataSubject = new BehaviorSubject<TaskType[] | null>(null);
  readonly taskTypeMetadata$ = this.taskTypeMetadataSubject.asObservable();

  private readonly http = inject(HttpClient);

  getTaskTypes(): Observable<TaskType[]> {
    const cachedMetadata = this.taskTypeMetadataSubject.value;

    if (cachedMetadata) {
      return of(cachedMetadata);
    }

    return this.http.get<TaskType[]>(this.baseUrl).pipe(
      tap((metadata) => this.taskTypeMetadataSubject.next(metadata))
    );
  }

  getTaskType(id: number): Observable<TaskType | null> {
    return this.getTaskTypes().pipe(
      map((types) => types.find((type) => type.typeValue === id) ?? null),
    );
  }

  getFormSchema(type: number, targetStatus: number): Observable<FormField[]> {
    return this.http.get<FormField[]>(`${this.baseUrl}/schema/${type}/${targetStatus}`);
  }
}