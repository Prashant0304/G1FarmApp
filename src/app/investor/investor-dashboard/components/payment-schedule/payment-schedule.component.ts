import { Component, OnInit } from '@angular/core';
import { InvestorService } from '../../../investor.service';

import * as XLSX from 'xlsx';

@Component({
  selector: 'app-payment-schedule',
  standalone: false,
  templateUrl: './payment-schedule.component.html',
  styleUrls: ['./payment-schedule.component.css'],
})
export class PaymentScheduleComponent implements OnInit {
  investorId = Number(localStorage.getItem('investorId')) || 1;
  paymentSchedules: any[] = [];
  loading = false;

  constructor(private investorService: InvestorService) {}

  ngOnInit(): void {
    this.loadPayments();
  }

  loadPayments(): void {
    this.loading = true;
    this.investorService.getPaymentSchedule(this.investorId).subscribe({
      next: (res: any) => {
        this.paymentSchedules = res;
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.loading = false;
      },
    });
  }

  get totalPaid(): number {
    return this.paymentSchedules.reduce(
      (sum, s) => sum + (s.totalPaid || 0),
      0,
    );
  }

  exportToExcel(): void {
    const exportData = this.paymentSchedules.map((item) => ({
      Project: item.projectName,
      Crop: item.cropName,
      Frequency: item.frequencyName,
      'Installment Amount': item.installmentAmount,
      'Paid Amount': item.paidAmount,
      'Remaining Amount': item.remainingAmount,
      'Total Paid': item.totalPaid,
      Status: item.status,
    }));

    exportData.push({
      Project: '',
      Crop: '',
      Frequency: '',
      'Installment Amount': '',
      'Paid Amount': '',
      'Remaining Amount': 'Grand Total',
      'Total Paid': this.totalPaid,
      Status: '',
    } as any);

    const worksheet = XLSX.utils.json_to_sheet(exportData);

    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Payment Schedule');

    XLSX.writeFile(workbook, `Payment_Schedule_${new Date().getTime()}.xlsx`);
  }
}
