// src/app/shared/layout/layout.component.ts
import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { SecureStorageService } from '../../secure-storage.service';
import { LayoutService } from './layout.service';

@Component({
  selector: 'app-layout',
  standalone: false,
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.css'],
})
export class LayoutComponent implements OnInit, OnDestroy {
  // ── Sidebar ──
  sidebarOpen = false;
  langDropdownOpen = false;
  profileDropdownOpen = false;

  // ── User info (swap with your AuthService) ──
  userName = 'Admin User';
  userEmail = 'admin@farmflow.com';

  // ── Language ──
  currentLang: string = localStorage.getItem('lang') || '2';

  private langMeta: Record<string, { label: string; flag: string }> = {
    kn: { label: 'ಕನ್ನಡ', flag: '🇮🇳' },
    en: { label: 'English', flag: '🇬🇧' },
    hi: { label: 'हिन्दी', flag: '🇮🇳' },
    te: { label: 'తెలుగు', flag: '🇮🇳' },
    ta: { label: 'தமிழ்', flag: '🇮🇳' },
  };

  languages: {
    code: string;
    numericCode: string;
    label: string;
    flag: string;
  }[] = [];

  // ── Dynamic menu ──
  menuItems: {
    MenuId: number;
    MenuKey: string;
    MenuRoute: string;
    Icon: string;
    DisplayOrder: number;
    MenuLabel: string;
  }[] = [];
  isMenuLoading = true;

  // ── Breadcrumb ──
  currentPageTitle = 'Dashboard';
  private routerSub!: Subscription;

  constructor(
    private router: Router,
    private secureStorage: SecureStorageService,
    private layoutService: LayoutService,
  ) {}

  ngOnInit() {
    // Set lang BEFORE loadLanguages so currentLangMeta resolves immediately
    // Always coerce to string so it matches numericCode (which is also a string)
    this.currentLang = String(
      this.secureStorage.getItem('lang') || localStorage.getItem('lang') || '2',
    );

    this.loadLanguages();
    this.loadMenus();

    this.routerSub = this.router.events
      .pipe(filter((e) => e instanceof NavigationEnd))
      .subscribe((e: any) => {
        this.currentPageTitle = this.getPageTitle(e.urlAfterRedirects);
        if (window.innerWidth < 1024) this.sidebarOpen = false;
      });

    this.currentPageTitle = this.getPageTitle(this.router.url);

    if (window.innerWidth >= 1024) this.sidebarOpen = true;
  }

  ngOnDestroy() {
    this.routerSub?.unsubscribe();
  }

  // ─────────────────────────────────────────────────
  // Menus
  // ─────────────────────────────────────────────────

  loadMenus() {
    this.isMenuLoading = true;

    // roleId — replace with real value from AuthService when ready
    const roleId = Number(this.secureStorage.getItem('roleId') || 1);

    this.layoutService.getMenus(roleId, this.currentLang).subscribe({
      next: (res: any) => {
        const raw = res.data || res || [];
        this.menuItems = raw
          .map((m: any) => ({
            MenuId: m.MenuId,
            MenuKey: m.MenuKey,
            MenuRoute: m.MenuRoute,
            Icon: m.Icon,
            DisplayOrder: m.DisplayOrder,
            MenuLabel: m.MenuLabel,
          }))
          .sort((a: any, b: any) => a.DisplayOrder - b.DisplayOrder);
        this.isMenuLoading = false;
      },
      error: () => {
        // Fallback hardcoded menu so the app doesn't break if API is down
        this.menuItems = [
          {
            MenuId: 1,
            MenuKey: 'Dashboard',
            MenuRoute: '/admin/dashboard',
            Icon: 'bi bi-speedometer2',
            DisplayOrder: 1,
            MenuLabel: 'Dashboard',
          },
          {
            MenuId: 2,
            MenuKey: 'Farmers',
            MenuRoute: '/admin/farmers',
            Icon: 'bi bi-people',
            DisplayOrder: 2,
            MenuLabel: 'Farmers',
          },
          {
            MenuId: 3,
            MenuKey: 'Contracts',
            MenuRoute: '/admin/contracts',
            Icon: 'bi bi-file-earmark-text',
            DisplayOrder: 3,
            MenuLabel: 'Contracts',
          },
          {
            MenuId: 4,
            MenuKey: 'Crops',
            MenuRoute: '/admin/crops',
            Icon: 'bi bi-flower1',
            DisplayOrder: 4,
            MenuLabel: 'Crops',
          },
          {
            MenuId: 5,
            MenuKey: 'Lands',
            MenuRoute: '/admin/lands',
            Icon: 'bi bi-map',
            DisplayOrder: 5,
            MenuLabel: 'Lands',
          },
          {
            MenuId: 6,
            MenuKey: 'Harvests',
            MenuRoute: '/admin/harvests',
            Icon: 'bi bi-basket2',
            DisplayOrder: 6,
            MenuLabel: 'Harvests',
          },
          {
            MenuId: 7,
            MenuKey: 'Reports',
            MenuRoute: '/admin/reports',
            Icon: 'bi bi-bar-chart-line',
            DisplayOrder: 7,
            MenuLabel: 'Reports',
          },
        ];
        this.isMenuLoading = false;
      },
    });
  }

  // ─────────────────────────────────────────────────
  // Languages
  // ─────────────────────────────────────────────────

  loadLanguages() {
    this.layoutService.getLangauges().subscribe({
      next: (res: any) => {
        // Handle both: direct array [] and wrapped { data: [] }
        const raw: { LanguageCode: string; Name: string }[] = Array.isArray(res)
          ? res
          : Array.isArray(res?.data)
            ? res.data
            : [];

        if (!raw.length) {
          console.warn('Language API returned empty array, using fallback');
          this.useFallbackLanguages();
          return;
        }

        this.languages = raw
          .map((l) => ({
            numericCode: String(l.LanguageCode), // ensure string
            code: l.Name,
            label: this.langMeta[l.Name]?.label ?? l.Name,
            flag: this.langMeta[l.Name]?.flag ?? '🌐',
          }))
          .sort((a, b) => Number(a.numericCode) - Number(b.numericCode));

        // Re-validate currentLang after languages arrive
        const exists = this.languages.some(
          (l) => l.numericCode === this.currentLang,
        );
        if (!exists && this.languages.length) {
          this.currentLang = this.languages[0].numericCode;
        }

        console.log('Languages loaded:', this.languages);
        console.log(
          'Current lang:',
          this.currentLang,
          '→',
          this.currentLangMeta,
        );
      },
      error: (err) => {
        console.error('Language API error:', err);
        this.useFallbackLanguages();
      },
    });
  }

  private useFallbackLanguages() {
    this.languages = Object.entries(this.langMeta).map(([code, meta], i) => ({
      numericCode: String(i + 1),
      code,
      label: meta.label,
      flag: meta.flag,
    }));
  }

  get currentLangMeta() {
    return this.languages.find((l) => l.numericCode === this.currentLang);
  }

  toggleLangDropdown() {
    this.langDropdownOpen = !this.langDropdownOpen;
    this.profileDropdownOpen = false;
  }

  changeLanguage(numericCode: string) {
    if (this.currentLang === numericCode) {
      this.langDropdownOpen = false;
      return;
    }
    this.currentLang = numericCode;
    localStorage.setItem('lang', numericCode);
    this.secureStorage.setItem('lang', numericCode);
    this.langDropdownOpen = false;
    window.location.reload();
  }

  // ─────────────────────────────────────────────────
  // Sidebar
  // ─────────────────────────────────────────────────

  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
  }
  closeSidebar() {
    this.sidebarOpen = false;
  }

  onNavClick() {
    if (window.innerWidth < 1024) this.sidebarOpen = false;
  }

  // ─────────────────────────────────────────────────
  // Profile
  // ─────────────────────────────────────────────────

  toggleProfileDropdown() {
    this.profileDropdownOpen = !this.profileDropdownOpen;
    this.langDropdownOpen = false;
  }

  goToProfile() {
    this.router.navigate(['/admin/settings']);
    this.profileDropdownOpen = false;
  }
  goToSettings() {
    this.router.navigate(['/admin/settings']);
    this.profileDropdownOpen = false;
  }

  logout() {
    localStorage.clear();
    this.secureStorage.clear?.();
    this.router.navigate(['/auth/farmer-login']);
  }

  // ─────────────────────────────────────────────────
  // Global listeners
  // ─────────────────────────────────────────────────

  @HostListener('document:click', ['$event'])
  onDocClick(e: MouseEvent) {
    const t = e.target as HTMLElement;
    if (!t.closest('.lang-switcher')) this.langDropdownOpen = false;
    if (!t.closest('.profile-dropdown')) this.profileDropdownOpen = false;
  }

  @HostListener('document:keydown.escape')
  onEscape() {
    this.sidebarOpen = false;
  }

  // ─────────────────────────────────────────────────
  // Helpers
  // ─────────────────────────────────────────────────

  getUserInitials(): string {
    return this.userName
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  private getPageTitle(url: string): string {
    const path = url.split('?')[0];
    // Match from dynamic menu items first
    const match = this.menuItems.find(
      (m) => path === m.MenuRoute || path.startsWith(m.MenuRoute + '/'),
    );
    if (match) return match.MenuLabel || match.MenuKey;

    // Fallback map for routes not in the menu
    const fallback: Record<string, string> = {
      '/admin/settings': 'Settings',
    };
    for (const key of Object.keys(fallback)) {
      if (path === key || path.startsWith(key + '/')) return fallback[key];
    }
    return 'FarmFlow';
  }
}
