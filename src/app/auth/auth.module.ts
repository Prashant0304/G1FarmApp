import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FarmerRegistrationComponent } from './farmer-registration/farmer-registration';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { FarmerOtpComponent } from './farmer-otp/farmer-otp.component';
import { FarmerLoginComponent } from './farmer-login/farmer-login.component';
import { AdminLoginComponent } from './admin-login/admin-login.component';
import { InvestorLoginComponent } from './investor-login/investor-login.component';

const routes: Routes = [
  { path: '', redirectTo: 'farmer-registration', pathMatch: 'full' },
  { path: 'farmer-registration', component: FarmerRegistrationComponent },
  { path: 'farmer-login', component: FarmerLoginComponent },
  { path: 'admin-login', component: AdminLoginComponent },
  {
    path: 'investor-login',
    component: InvestorLoginComponent,
  },
];

@NgModule({
  declarations: [
    FarmerOtpComponent,
    FarmerRegistrationComponent,
    FarmerLoginComponent,
    AdminLoginComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forChild(routes),
  ],
})
export class AuthModule {}
