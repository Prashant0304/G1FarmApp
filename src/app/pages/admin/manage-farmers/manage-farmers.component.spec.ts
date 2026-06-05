import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageFarmersComponent } from './manage-farmers.component';

describe('ManageFarmersComponent', () => {
  let component: ManageFarmersComponent;
  let fixture: ComponentFixture<ManageFarmersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManageFarmersComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManageFarmersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
