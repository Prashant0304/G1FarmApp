import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecentInvestmentsComponent } from './recent-investments.component';

describe('RecentInvestmentsComponent', () => {
  let component: RecentInvestmentsComponent;
  let fixture: ComponentFixture<RecentInvestmentsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecentInvestmentsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RecentInvestmentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
