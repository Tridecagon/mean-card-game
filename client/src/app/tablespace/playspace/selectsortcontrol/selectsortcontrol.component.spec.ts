import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { SelectsortcontrolComponent } from './selectsortcontrol.component';

describe('SelectsortcontrolComponent', () => {
  let component: SelectsortcontrolComponent;
  let fixture: ComponentFixture<SelectsortcontrolComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ SelectsortcontrolComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SelectsortcontrolComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
