// src/app/pages/admin/dashboard/dashboard.component.ts
import { Component, OnInit } from '@angular/core';
import { DashboardService } from './dashboard.service';
import { SecureStorageService } from '../../../secure-storage.service';

@Component({
  selector: 'app-dashboard',
  standalone: false,
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent implements OnInit {
  today = new Date();
  isLoading = true;
  isRefreshing = false;

  // ── KPI stats ──
  stats = {
    totalFarmers: 0,
    activeContracts: 0,
    totalCrops: 0,
    totalHarvests: 0,
    totalPayments: 0,
    totalLands: 0,
    pendingUpdates: 0,
  };

  greetingText: string = '';

  // ── Recent contracts ──
  recentContracts: any[] = [];

  // ── Farmer updates ──
  farmerUpdates: any[] = [];

  // ── Crop distribution (built from crops data) ──
  cropDistribution: {
    name: string;
    emoji: string;
    pct: number;
    color: string;
  }[] = [];

  // ── Activity feed (built from multiple sources) ──
  activityFeed: {
    id: number;
    text: string;
    time: string;
    icon: string;
    color: string;
  }[] = [];

  private emojiMap: Record<string, string> = {
    tomato: '🍅',
    potato: '🥔',
    wheat: '🌾',
    rice: '🍚',
    corn: '🌽',
    onion: '🧅',
    garlic: '🧄',
    carrot: '🥕',
    cotton: '🌿',
    sugarcane: '🎋',
    mango: '🥭',
    banana: '🍌',
  };

  private colorPalette = [
    '#4caf7d',
    '#2d8653',
    '#e8a83a',
    '#e07b3a',
    '#5b9bd5',
    '#9b6bc4',
    '#e05a7a',
    '#3ab8c4',
  ];

  constructor(
    private dashService: DashboardService,
    private secureStorage: SecureStorageService,
  ) {}

  ngOnInit() {
    this.loadAll();
    this.setGreeting();
  }

  get lang() {
    return this.secureStorage.getItem('lang') || '2';
  }

  setGreeting() {
    const hour = new Date().getHours();

    if (hour < 12) {
      this.greetingText = '🌤️ Good morning';
    } else if (hour < 17) {
      this.greetingText = '☀️ Good afternoon';
    } else {
      this.greetingText = '🌙 Good evening';
    }
  }

  loadAll() {
    this.isLoading = true;
    this.isRefreshing = true;
    let pending = 0;
    const done = () => {
      pending--;
      if (pending === 0) {
        this.isLoading = false;
        this.isRefreshing = false;
      }
    };

    // ── Contracts ──
    pending++;
    this.dashService.getRecentContracts(this.lang).subscribe({
      next: (res: any) => {
        const all = res.data || [];
        this.stats.activeContracts = res.total ?? all.length;
        this.recentContracts = all.slice(0, 6).map((c: any) => ({
          ContractId: c.ContractId ?? c.contractId,
          FarmerName: c.FarmerName ?? c.farmerName,
          CropName: c.CropName ?? c.cropName,
          AgreedRatePerKg: c.AgreedRatePerKg ?? c.agreedRatePerKg,
          Status: c.Status ?? c.status,
        }));
        this.buildActivityFromContracts(all);
        done();
      },
      error: () => done(),
    });

    pending++;
    this.dashService.getDashboardStats().subscribe({
      next: (res: any) => {
        this.stats.totalFarmers = res.totalFarmers ?? 0;
        this.stats.totalHarvests = res.totalHarvests ?? 0;
        this.stats.totalPayments = res.totalPayment ?? 0;
        this.stats.totalLands = res.totalLands ?? 0;

        done();
      },
      error: () => done(),
    });

    // ── Crop Distribution ──
    pending++;
    this.dashService.getCropDistribution(this.lang).subscribe({
      next: (res: any) => {
        const distribution = res.data || [];

        this.buildCropDistribution(distribution);

        done();
      },
      error: () => done(),
    });

    // ── Farmer Updates ──
    pending++;
    this.dashService.getFarmerUpdates().subscribe({
      next: (res: any) => {
        const updates = res.data || [];
        this.farmerUpdates = updates.slice(0, 5).map((u: any) => ({
          UpdateId: u.UpdateId ?? u.updateId,
          FarmerName: u.FarmerName ?? u.farmerName,
          StageKey: u.StageKey ?? u.stageKey,
          Notes: u.Notes ?? u.notes,
          UpdatedDate: u.UpdatedDate ?? u.updatedDate,
        }));
        this.stats.pendingUpdates = updates.length;
        done();
      },
      error: () => done(),
    });
  }

  // ─────────────────────────────────────────────────
  // Builders
  // ─────────────────────────────────────────────────

  private buildCropDistribution(data: any[]) {
    this.cropDistribution = data.map((c: any, i: number) => ({
      name: c.CropName ?? c.CropKey ?? c.cropName,
      emoji: this.getCropEmoji(c.CropKey ?? c.cropKey ?? ''),
      pct: Math.round(c.Percentage),
      color: this.colorPalette[i % this.colorPalette.length],
    }));
  }

  private buildActivityFromContracts(contracts: any[]) {
    this.activityFeed = contracts.slice(0, 8).map((c: any, i: number) => ({
      id: i,
      text: `Contract for ${c.CropName ?? c.cropName} signed with ${c.FarmerName ?? c.farmerName}`,
      time: this.relativeTime(c.StartDate ?? c.startDate),
      icon: 'bi bi-file-earmark-check',
      color: i % 3 === 0 ? 'green' : i % 3 === 1 ? 'amber' : 'teal',
    }));
  }

  // ─────────────────────────────────────────────────
  // Helpers
  // ─────────────────────────────────────────────────

  formatAmount(val: number): string {
    if (!val) return '0';
    if (val >= 1_00_00_000) return (val / 1_00_00_000).toFixed(1) + 'Cr';
    if (val >= 1_00_000) return (val / 1_00_000).toFixed(1) + 'L';
    if (val >= 1_000) return (val / 1_000).toFixed(1) + 'K';
    return val.toString();
  }

  private relativeTime(dateStr: string): string {
    if (!dateStr) return 'Recently';
    const diff = Date.now() - new Date(dateStr).getTime();
    const days = Math.floor(diff / 86_400_000);
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
    return `${Math.floor(days / 30)} months ago`;
  }

  private getCropEmoji(key: string): string {
    const l = key.toLowerCase();
    for (const k of Object.keys(this.emojiMap)) {
      if (l.includes(k)) return this.emojiMap[k];
    }
    return '🌱';
  }
}
