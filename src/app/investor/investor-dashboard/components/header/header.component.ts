import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-header',
  standalone: false,
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
})
export class HeaderComponent implements OnInit {
  @Input() investor: any = {};
  @Input() sidebarCollapsed = false;
  @Output() toggleSidebar = new EventEmitter<void>();

  pageTitle = 'Overview';
  pageSubtitle = 'Welcome back';

  private routeTitles: Record<string, { title: string; subtitle: string }> = {
    '/investor/overview': {
      title: 'Overview',
      subtitle: 'Your investment summary at a glance',
    },
    '/investor/portfolio': {
      title: 'My Portfolio',
      subtitle: 'Crops, allocations & performance',
    },
    '/investor/projects': {
      title: 'Projects',
      subtitle: 'All farm projects you are part of',
    },
    '/investor/payments': {
      title: 'Payments',
      subtitle: 'Installment schedule & history',
    },
  };

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.setTitleFromUrl(this.router.url);

    this.router.events
      .pipe(filter((e) => e instanceof NavigationEnd))
      .subscribe((e: any) => this.setTitleFromUrl(e.urlAfterRedirects));
  }

  private setTitleFromUrl(url: string): void {
    const match = Object.keys(this.routeTitles).find((k) => url.startsWith(k));
    if (match) {
      this.pageTitle = this.routeTitles[match].title;
      this.pageSubtitle = this.routeTitles[match].subtitle;
    }
  }
}
