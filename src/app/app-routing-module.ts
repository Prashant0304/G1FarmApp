import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LayoutComponent } from './shared/layout/layout.component';
import { AddContract } from './pages/admin/add-contract/add-contract';

const routes: Routes = [
  {
    path: 'auth',
    loadChildren: () => import('./auth/auth.module').then((m) => m.AuthModule),
  },

  {
    path: 'admin',
    component: LayoutComponent,
    children: [
      {
        path: '',
        loadChildren: () =>
          import('./pages/admin/admin.module').then((m) => m.AdminModule),
      },
    ],
  },
  {
    path: 'farmer',
    loadChildren: () =>
      import('./farmer/farmer-module').then((m) => m.FarmerModule),
  },
  {
    path: 'investor',
    loadChildren: () =>
      import('./investor/investor.module').then((m) => m.InvestorModule),
  },
  { path: '', redirectTo: 'auth/farmer-login', pathMatch: 'full' },
  { path: 'add-contract', component: AddContract },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
