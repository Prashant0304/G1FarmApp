import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegisterInvestorComponent } from './register-investor.component';

describe('RegisterInvestorComponent', () => {
  let component: RegisterInvestorComponent;
  let fixture: ComponentFixture<RegisterInvestorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegisterInvestorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RegisterInvestorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
