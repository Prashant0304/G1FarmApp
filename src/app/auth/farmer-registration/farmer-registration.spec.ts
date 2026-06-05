import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FarmerRegistration } from './farmer-registration';

describe('FarmerRegistration', () => {
  let component: FarmerRegistration;
  let fixture: ComponentFixture<FarmerRegistration>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FarmerRegistration]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FarmerRegistration);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
