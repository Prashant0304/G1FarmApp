import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CropAllocationComponent } from './crop-allocation.component';

describe('CropAllocationComponent', () => {
  let component: CropAllocationComponent;
  let fixture: ComponentFixture<CropAllocationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CropAllocationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CropAllocationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
