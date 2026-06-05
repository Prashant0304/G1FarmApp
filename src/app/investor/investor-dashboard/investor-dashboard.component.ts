import { Component, OnInit } from '@angular/core';
import { InvestorService } from '../investor.service';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-investor-dashboard',
  standalone: false,
  templateUrl: './investor-dashboard.component.html',
  styleUrls: ['./investor-dashboard.component.css'],
})
export class InvestorDashboardComponent implements OnInit {
  activeTab = 'overview';

  selectedProjectFilter = 'All';
  searchQuery = '';

  investorId = Number(localStorage.getItem('investorId')) || 1;
  investor: any;
  profile: any = {};
  dashboard: any = {};
  investments: any[] = [];
  cropAllocation: any[] = [];
  paymentSchedules: any = [];
  monthlyData: any[] = [];

  loading = false;
  sidebarCollapsed = false;
  mobileSidebarOpen = false;

  toggleSidebar(): void {
    if (window.innerWidth <= 768) {
      this.mobileSidebarOpen = !this.mobileSidebarOpen;
    } else {
      this.sidebarCollapsed = !this.sidebarCollapsed;
    }
  }

  closeSidebar(): void {
    this.mobileSidebarOpen = false;
  }
  constructor(
    private investorService: InvestorService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  logout(): void {
    Swal.fire({
      title: 'Are you sure?',
      text: 'You will be logged out of your session.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#2e7d32', // Premium dark green matching your theme
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, sign out!',
      cancelButtonText: 'Cancel',
      color: '#1a1a1a', // Matches dark sidebar theme if desired
      background: '#ffffff', // Text color for dark theme
    }).then((result) => {
      if (result.isConfirmed) {
        // Clear session storage data
        localStorage.clear();

        // Show a quick success toast or message (optional)
        Swal.fire({
          title: 'Logged Out!',
          text: 'You have been successfully signed out.',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false,
          color: '#1a1a1a',
          background: '#ffffff',
        });

        // Redirect to login page
        this.router.navigate(['auth/investor-login']);
      }
    });
  }

  loadData(): void {
    this.loading = true;

    this.loadProfile();
    this.loadDashboard();
    this.loadInvestments();
    this.loadCropAllocation();
    this.loading = false;
  }

  loadProfile(): void {
    this.investorService.getProfile(this.investorId).subscribe({
      next: (res: any) => {
        this.profile = res;
        this.investor = res;
      },
      error: (err) => console.error(err),
    });
  }

  loadDashboard(): void {
    this.investorService.getDashboard(this.investorId).subscribe({
      next: (res: any) => {
        if (Array.isArray(res) && res.length > 0) {
          this.dashboard = res[0];
        } else {
          this.dashboard = res;
        }
      },
      error: (err) => console.error(err),
    });
  }

  loadInvestments(): void {
    this.investorService.getPaymentSchedule(this.investorId).subscribe({
      next: (res: any) => {
        debugger;
        console.log('API Response:', res);
        console.log('Is Array:', Array.isArray(res));
        this.paymentSchedules = res;
        console.log(this.paymentSchedules);

        this.investments = res.map((item: any) => ({
          projectInvestorId: item.projectInvestorId,

          status: item.projectStatus,

          cropKey: item.cropKey,

          plantCount: item.investorPlantCount,

          amountInvested: item.amountInvested,

          investmentDate: item.investmentDate,

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
            estimatedInvestment: item.estimatedInvestment,
            paymentFrequency: item.paymentFrequency,
            totalPlants: item.totalPlants,
            status: item.projectStatus,

            crops: [
              {
                projectCropId: item.projectCropId,
                cropKey: item.cropKey,
                categoryKey: item.categoryKey,
                plantCount: item.investorPlantCount,
                costPerPlant: item.costPerPlant,
                estimatedYieldKg: item.estimatedYieldKg,
                expectedHarvestDate: item.expectedHarvestDate,
                totalEstimatedCost: item.totalEstimatedCost,
              },
            ],
          },
        }));
        console.log('Mapped Investments:', this.investments);
      },
      error: (err) => console.error(err),
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

  get totalPendingInstallments(): number {
    return this.investments.reduce(
      (sum, inv) => sum + (inv.installmentCount - inv.paidInstallments),
      0,
    );
  }

  get nextInstallmentAmount(): number {
    const active = this.investments.find((x) => x.status === 'Active');

    return active ? active.installmentAmount : 0;
  }

  get totalExpectedReturns(): number {
    return this.investments.reduce((sum, inv) => sum + inv.expectedReturn, 0);
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

  formatCurrency(amount: number): string {
    debugger;
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

  setActiveTab(tab: string): void {
    this.activeTab = tab;
  }

  trackByInvestorId(index: number, item: any): number {
    return item.projectInvestorId;
  }
}
