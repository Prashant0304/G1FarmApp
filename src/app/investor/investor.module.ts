import { CommonModule } from '@angular/common';
import { NgModule, Component } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { InvestorLoginComponent } from '../auth/investor-login/investor-login.component';

import { InvestorDashboardComponent } from './investor-dashboard/investor-dashboard.component';
import { FormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { SidebarComponent } from './investor-dashboard/components/sidebar/sidebar.component';
import { InvestorLayoutComponent } from '../shared/investor-layout/investor-layout.component';
import { PortfolioComponent } from './investor-dashboard/components/portfolio/portfolio.component';
import { ProjectListComponent } from './investor-dashboard/components/project-list/project-list.component';
import { PaymentScheduleComponent } from './investor-dashboard/components/payment-schedule/payment-schedule.component';
import { HeaderComponent } from './investor-dashboard/components/header/header.component';
import { OverviewComponent } from './investor-dashboard/components/overview/overview.component';

const routes: Routes = [
  {
    path: 'investor',
    component: InvestorLayoutComponent,
    children: [
      {
        path: 'overview',
        component: OverviewComponent,
      },
      {
        path: 'portfolio',
        component: PortfolioComponent,
      },
      {
        path: 'projects',
        component: ProjectListComponent,
      },
      {
        path: 'payments',
        component: PaymentScheduleComponent,
      },
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },
    ],
  },
];

@NgModule({
  declarations: [
    InvestorDashboardComponent,
    SidebarComponent,
    HeaderComponent,
    OverviewComponent,
    PaymentScheduleComponent,
    ProjectListComponent,
    PortfolioComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    RouterModule.forChild(routes),
  ],
  exports: [SidebarComponent, HeaderComponent],
})
export class InvestorModule {}
