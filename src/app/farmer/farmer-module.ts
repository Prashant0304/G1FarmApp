import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FarmerDashboardComponent } from './farmer-dashboard/farmer-dashboard.component';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule } from '@angular/forms';

const routes: Routes = [
  { path: '', redirectTo: 'farmer-dashboard', pathMatch: 'full' },
  { path: 'farmer-dashboard', component: FarmerDashboardComponent },
];

@NgModule({
  declarations: [FarmerDashboardComponent],
  imports: [CommonModule, FormsModule, RouterModule.forChild(routes)],
})
export class FarmerModule {}
