import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { InvestorService } from '../../investor/investor.service';

@Component({
  selector: 'app-investor-layout',
  standalone: false,
  templateUrl: './investor-layout.component.html',
  styleUrls: ['./investor-layout.component.css'],
})
export class InvestorLayoutComponent implements OnInit {
  investorId = Number(localStorage.getItem('investorId')) || 1;
  investor: any = {};

  sidebarCollapsed = false;
  mobileSidebarOpen = false;

  constructor(
    private investorService: InvestorService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile(): void {
    this.investorService.getProfile(this.investorId).subscribe({
      next: (res: any) => {
        this.investor = res;
      },
      error: (err) => console.error(err),
    });
  }

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

  logout(): void {
    Swal.fire({
      title: 'Are you sure?',
      text: 'You will be logged out of your session.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#2e7d32',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, sign out!',
      cancelButtonText: 'Cancel',
      background: '#ffffff',
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.clear();
        Swal.fire({
          title: 'Logged Out!',
          text: 'You have been successfully signed out.',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false,
        });
        this.router.navigate(['auth/investor-login']);
      }
    });
  }
}
