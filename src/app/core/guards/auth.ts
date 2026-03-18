import { CanActivateFn, Router } from "@angular/router";
import { AuthService } from "../services/auth-service";
import { inject } from "@angular/core/primitives/di";

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const user = authService.currentUser$.value;

  if (!user) {
    router.navigate(['/auth']);
    return false;
  }

  return true;
};