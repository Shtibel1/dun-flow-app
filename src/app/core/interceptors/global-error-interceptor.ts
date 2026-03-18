import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

export const globalErrorInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      const problemDetailsMessage =
        error.error?.detail ?? error.error?.title ?? error.error?.message ?? 'Request failed.';

      return throwError(() => new Error(problemDetailsMessage));
    }),
  );
};
