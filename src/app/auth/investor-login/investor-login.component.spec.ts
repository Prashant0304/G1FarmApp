import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InvestorLoginComponent } from './investor-login.component';

describe('InvestorLoginComponent', () => {
  let component: InvestorLoginComponent;
  let fixture: ComponentFixture<InvestorLoginComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InvestorLoginComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InvestorLoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
