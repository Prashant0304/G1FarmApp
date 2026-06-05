import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InvestorLayoutComponent } from './investor-layout.component';

describe('InvestorLayoutComponent', () => {
  let component: InvestorLayoutComponent;
  let fixture: ComponentFixture<InvestorLayoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InvestorLayoutComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InvestorLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
