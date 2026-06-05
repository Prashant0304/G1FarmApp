import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LayoutComponent } from './layout/layout.component';
import { LoaderComponent } from './loader/loader.component';
import { InvestorModule } from '../investor/investor.module';
import { InvestorLayoutComponent } from './investor-layout/investor-layout.component';

@NgModule({
  declarations: [LayoutComponent, LoaderComponent, InvestorLayoutComponent],
  imports: [CommonModule, RouterModule, InvestorModule],
  exports: [LayoutComponent, LoaderComponent],
})
export class SharedModule {}
