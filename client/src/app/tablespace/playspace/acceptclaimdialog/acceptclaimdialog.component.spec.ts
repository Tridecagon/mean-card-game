import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AcceptclaimdialogComponent } from './acceptclaimdialog.component';

describe('AcceptclaimdialogComponent', () => {
  let component: AcceptclaimdialogComponent;
  let fixture: ComponentFixture<AcceptclaimdialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AcceptclaimdialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AcceptclaimdialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
