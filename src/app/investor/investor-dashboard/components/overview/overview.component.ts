import { Component, OnInit } from '@angular/core';
import { InvestorService } from '../../../investor.service';

@Component({
  selector: 'app-overview',
  standalone: false,
  templateUrl: './overview.component.html',
  styleUrls: ['./overview.component.css'],
})
export class OverviewComponent implements OnInit {
  activeTab = 'overview';
  investor: any;
  investorId = Number(localStorage.getItem('investorId')) || 1;
  dashboard: any = {};
  cropAllocation: any[] = [];
  loading = false;
  investments: any[] = [];

  constructor(private investorService: InvestorService) {}

  ngOnInit(): void {
    this.loadDashboard();
    this.loadCropAllocation();
  }

  loadDashboard(): void {
    this.loading = true;
    this.investorService.getDashboard(this.investorId).subscribe({
      next: (res: any) => {
        this.dashboard = Array.isArray(res) && res.length > 0 ? res[0] : res;
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.loading = false;
      },
    });
  }

  loadCropAllocation(): void {
    this.investorService.getProjectDetail(this.investorId).subscribe({
      next: (res: any) => {
        this.cropAllocation = res.map((item: any, index: number) => ({
          label: item.categoryKey,
          value: item.percentage,
          amount: item.amount,
          color: this.getChartColor(index),
        }));
      },
      error: (err) => console.error(err),
    });
  }

  getChartColor(index: number): string {
    const colors = ['#3B6D11', '#639922', '#97C459', '#C2E07A'];
    return colors[index % colors.length];
  }

  formatCurrency(amount: number): string {
    return '₹' + Number(amount || 0).toLocaleString('en-IN');
  }

  trackByInvestorId(index: number, item: any): number {
    return item.projectInvestorId;
  }

  getProjectProgress(inv: any): number {
    const start = new Date(inv.project.startDate).getTime();
    const end = new Date(inv.project.endDate).getTime();
    const now = new Date().getTime();

    return Math.max(
      0,
      Math.min(100, Math.round(((now - start) / (end - start)) * 100)),
    );
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'Active':
        return 'status-active';

      case 'Completed':
        return 'status-completed';

      case 'Planning':
        return 'status-planning';

      case 'OnHold':
        return 'status-hold';

      default:
        return '';
    }
  }

  setActiveTab(tab: string): void {
    this.activeTab = tab;
  }
}
