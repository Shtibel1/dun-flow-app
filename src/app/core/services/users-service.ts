import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { User } from '../models/user';

@Injectable({
  providedIn: 'root',
})
export class UsersService {
  private readonly baseUrl = `${environment.baseUrl}/api/Users`;
  private readonly usersSubject = new BehaviorSubject<User[]>([]);
  readonly users$ = this.usersSubject.asObservable();

  private readonly http = inject(HttpClient);

  getUsers(): Observable<User[]> {
    if (this.usersSubject.value.length > 0) {
      return this.users$;
    }

    return this.http.get<User[]>(this.baseUrl).pipe(
      tap((users) => this.usersSubject.next(users))
    );
  }
}
