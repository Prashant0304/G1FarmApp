import { Component, OnInit } from '@angular/core';
import { InvestorService } from '../../../investor.service';

@Component({
  selector: 'app-portfolio',
  standalone: false,
  templateUrl: './portfolio.component.html',
  styleUrls: ['./portfolio.component.css'],
})
export class PortfolioComponent implements OnInit {
  investorId = Number(localStorage.getItem('investorId')) || 1;
  investments: any[] = [];
  selectedProjectFilter = 'All';
  searchQuery = '';
  loading = false;

  constructor(private investorService: InvestorService) {}

  ngOnInit(): void {
    this.loadInvestments();
  }

  loadInvestments(): void {
    this.loading = true;
    this.investorService.getPaymentSchedule(this.investorId).subscribe({
      next: (res: any) => {
        this.investments = res.map((item: any) => ({
          projectInvestorId: item.projectInvestorId,
          status: item.projectStatus,
          cropKey: item.cropKey,
          plantCount: item.investorPlantCount,
          amountInvested: item.amountInvested,
          paymentFrequency: item.paymentFrequency,
          installmentCount: item.installmentCount,
          installmentAmount: item.installmentAmount,
          paidInstallments: 0,
          expectedReturn: item.totalEstimatedCost || item.amountInvested * 1.5,
          returnPercentage:
            item.amountInvested > 0
              ? Math.round(
                  ((item.totalEstimatedCost - item.amountInvested) /
                    item.amountInvested) *
                    100,
                )
              : 0,
          project: {
            projectId: item.projectId,
            projectCode: item.projectCode,
            projectName: item.projectName,
            location: item.landLocation,
            startDate: item.startDate,
            endDate: item.endDate,
          },
        }));
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.loading = false;
      },
    });
  }

  get filteredInvestments(): any[] {
    return this.investments.filter((inv) => {
      const matchesFilter =
        this.selectedProjectFilter === 'All' ||
        inv.status === this.selectedProjectFilter;
      const matchesSearch =
        !this.searchQuery ||
        inv.project.projectName
          .toLowerCase()
          .includes(this.searchQuery.toLowerCase()) ||
        inv.cropKey.toLowerCase().includes(this.searchQuery.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  }

  getInstallmentProgress(inv: any): number {
    if (!inv.installmentCount) return 0;
    return Math.round((inv.paidInstallments / inv.installmentCount) * 100);
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

  getDaysRemaining(endDate: string): number {
    const end = new Date(endDate).getTime();
    const now = new Date().getTime();
    return Math.ceil((end - now) / (1000 * 60 * 60 * 24));
  }

  getStatusClass(status: string): string {
    const map: Record<string, string> = {
      Active: 'status-active',
      Completed: 'status-completed',
      Planning: 'status-planning',
      OnHold: 'status-hold',
    };
    return map[status] || '';
  }

  formatCurrency(amount: number): string {
    return '₹' + Number(amount || 0).toLocaleString('en-IN');
  }

  formatDate(date: string): string {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  }

  trackByInvestorId(index: number, item: any): number {
    return item.projectInvestorId;
  }
}
