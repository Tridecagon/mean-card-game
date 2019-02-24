import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectsortcontrolComponent } from './selectsortcontrol.component';

describe('SelectsortcontrolComponent', () => {
  let component: SelectsortcontrolComponent;
  let fixture: ComponentFixture<SelectsortcontrolComponent>;

  beforeEach(async(() => {
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
