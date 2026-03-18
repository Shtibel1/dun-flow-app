import { Injectable, computed, signal, inject } from '@angular/core';
import { User } from '../models/user';
import { BehaviorSubject } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly storageKey = 'dunflow.currentUser';
  currentUser$ = new BehaviorSubject<User | null>(null);

  private router = inject(Router);

  constructor() {
    const storedUser = localStorage.getItem(this.storageKey);
    if (storedUser) {
      try {
        const user: User = JSON.parse(storedUser);
        this.currentUser$.next(user);
      } catch (error) {
        console.error('Failed to parse stored user:', error);
        localStorage.removeItem(this.storageKey);
      }
    }
  }

  login(user: User | null): void {
    console.log('AuthService.login called with user:', user);
    if (!user) return;
    this.currentUser$.next(user);
    localStorage.setItem(this.storageKey, JSON.stringify(user));
    this.router.navigate(['/']);
  }

  logout(): void {
    this.currentUser$.next(null);
    localStorage.removeItem(this.storageKey);
    this.router.navigate(['/auth']);
  }
}
