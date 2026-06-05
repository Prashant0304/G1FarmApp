import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FarmerOtpComponent } from './farmer-otp.component';

describe('FarmerOtpComponent', () => {
  let component: FarmerOtpComponent;
  let fixture: ComponentFixture<FarmerOtpComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FarmerOtpComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FarmerOtpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
