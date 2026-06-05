import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { AddContract } from './add-contract/add-contract';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { CropsComponent } from './crops/crops.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ManageFarmersComponent } from './manage-farmers/manage-farmers.component';
import { RegisterInvestorComponent } from './register-investor/register-investor.component';
import { ProjectComponent } from './project/project.component';
import { SumTotalCostPipe } from './project/sumTotalCost.pipe';

const routes: Routes = [
  { path: '', redirectTo: 'add-contract', pathMatch: 'full' },
  { path: 'add-contract', component: AddContract },
  { path: 'crops', component: CropsComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'manage-farmers', component: ManageFarmersComponent },
  { path: 'register-investor', component: RegisterInvestorComponent },
  { path: 'project', component: ProjectComponent },
];

@NgModule({
  declarations: [
    AddContract,
    CropsComponent,
    DashboardComponent,
    ManageFarmersComponent,
    RegisterInvestorComponent,
    ProjectComponent,
    SumTotalCostPipe,
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    FormsModule,
    NgSelectModule,
    ReactiveFormsModule,
  ],
})
export class AdminModule {}
