
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { LoaderService } from './loader.service';

@Component({
  selector: 'app-loader',
  standalone: false,
  templateUrl: './loader.component.html',
  styleUrls: ['./loader.component.css'],
})
export class LoaderComponent implements OnInit, OnDestroy {

  isVisible = false;
  message   = 'Loading';
  progress  = 0;

  private subs = new Subscription();
  private progressTimer: any;

  drops = [
    { left: 40,  delay: 0    },
    { left: 80,  delay: 0.6  },
    { left: 120, delay: 1.2  },
    { left: 160, delay: 1.8  },
    { left: 60,  delay: 0.9  },
    { left: 100, delay: 0.3  },
    { left: 140, delay: 1.5  },
  ];

  plants = [
    { left: 28,  delay: 0,    duration: 2.0, stemH: 32, leafW: 18, leafH: 14 },
    { left: 64,  delay: 0.3,  duration: 1.7, stemH: 24, leafW: 14, leafH: 11 },
    { left: 100, delay: 0.6,  duration: 2.1, stemH: 36, leafW: 22, leafH: 16 },
    { left: 136, delay: 0.15, duration: 1.9, stemH: 28, leafW: 16, leafH: 12 },
    { left: 172, delay: 0.45, duration: 1.6, stemH: 22, leafW: 13, leafH: 10 },
  ];
  private loaderStartTime = 0;


  constructor(private loaderService: LoaderService) {}

   ngOnInit() {
    this.subs.add(
      this.loaderService.isLoading$.subscribe(loading => {

        if (loading) {

          this.loaderStartTime = Date.now();

          this.isVisible = true;
          this.progress = 0;

          this.startProgress();

        } else {

          this.progress = 100;

          const elapsed = Date.now() - this.loaderStartTime;

          // minimum visible time = 1800ms
          const remainingTime = Math.max(1800 - elapsed, 0);

          setTimeout(() => {
            this.isVisible = false;
            this.stopProgress();
          }, remainingTime);
        }
      })
    );

    this.subs.add(
      this.loaderService.message$.subscribe(msg => {
        this.message = msg;
      })
    );
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
    this.stopProgress();
  }

  private startProgress() {
    this.stopProgress();

    this.progressTimer = setInterval(() => {

      if (this.progress < 85) {
        this.progress += Math.random() * 6;
      }
      else if (this.progress < 92) {
        this.progress += Math.random() * 1.5;
      }

      if (this.progress > 92) {
        this.progress = 92;
      }

    }, 250);
  }

  private stopProgress() {
    if (this.progressTimer) {
      clearInterval(this.progressTimer);
      this.progressTimer = null;
    }
  }
}