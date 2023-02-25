import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ClaimdialogComponent } from './claimdialog.component';

describe('ClaimdialogComponent', () => {
  let component: ClaimdialogComponent;
  let fixture: ComponentFixture<ClaimdialogComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ClaimdialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ClaimdialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
