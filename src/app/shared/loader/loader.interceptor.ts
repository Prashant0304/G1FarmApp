import { Injectable } from '@angular/core';
import {
  HttpRequest, HttpHandler, HttpEvent,
  HttpInterceptor, HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { LoaderService } from './loader.service';

@Injectable()
export class LoaderInterceptor implements HttpInterceptor {

  // URLs to SKIP loader for (silent background calls)
  private skipUrls = [
    '/api/menus',       // sidebar menu — already loaded on layout init
    '/api/languages',   // language list — loaded silently on layout init
  ];

  constructor(private loaderService: LoaderService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

    // Don't show loader for skipped URLs
    const shouldSkip = this.skipUrls.some(url => req.url.includes(url));

    if (shouldSkip) {
      return next.handle(req);
    }

    this.loaderService.show();

    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        // Still hide loader on errors
        return throwError(() => error);
      }),
      finalize(() => {
        // finalize always runs — on success AND on error
        this.loaderService.hide();
      })
    );
  }
}