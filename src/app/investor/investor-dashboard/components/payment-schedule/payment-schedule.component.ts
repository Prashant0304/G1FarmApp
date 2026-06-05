import { Component, OnInit } from '@angular/core';
import { InvestorService } from '../../../investor.service';

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
}
