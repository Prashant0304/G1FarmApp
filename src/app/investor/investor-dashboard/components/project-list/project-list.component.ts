import { Component, OnInit } from '@angular/core';
import { InvestorService } from '../../../investor.service';

@Component({
  selector: 'app-project-list',
  standalone: false,
  templateUrl: './project-list.component.html',
  styleUrls: ['./project-list.component.css'],
})
export class ProjectListComponent implements OnInit {
  investorId = Number(localStorage.getItem('investorId')) || 1;
  investments: any[] = [];
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
          investmentDate: item.investmentDate,
          project: {
            projectId: item.projectId,
            projectCode: item.projectCode,
            projectName: item.projectName,
            location: item.landLocation,
            startDate: item.startDate,
            endDate: item.endDate,
            estimatedInvestment: item.estimatedInvestment,
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
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.loading = false;
      },
    });
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

  getStatusClass(status: string): string {
    const map: Record<string, string> = {
      Active: 'status-active',
      Completed: 'status-completed',
      Planning: 'status-planning',
      OnHold: 'status-hold',
    };
    return map[status] || '';
  }

  trackByInvestorId(index: number, item: any): number {
    return item.projectInvestorId;
  }
}
