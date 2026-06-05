import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class LoaderService {

  // Counter instead of boolean — handles multiple concurrent API calls
  private activeRequests = 0;

  // Components subscribe to this
  isLoading$ = new BehaviorSubject<boolean>(false);
  message$   = new BehaviorSubject<string>('Loading');

  show(message = 'Loading') {
    this.activeRequests++;
    this.message$.next(message);
    this.isLoading$.next(true);
  }

  hide() {
    this.activeRequests = Math.max(0, this.activeRequests - 1);
    // Only hide when ALL requests are done
    if (this.activeRequests === 0) {
      this.isLoading$.next(false);
    }
  }

  // Force hide — use on error recovery
  forceHide() {
    this.activeRequests = 0;
    this.isLoading$.next(false);
  }
}