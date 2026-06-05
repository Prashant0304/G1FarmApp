import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddContract } from './add-contract';

describe('AddContract', () => {
  let component: AddContract;
  let fixture: ComponentFixture<AddContract>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AddContract]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddContract);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
