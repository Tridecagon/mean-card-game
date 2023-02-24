import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { DialogUserComponent } from './dialog-user.component';

describe('DialogEditUserComponent', () => {
  let component: DialogUserComponent;
  let fixture: ComponentFixture<DialogUserComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ DialogUserComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DialogUserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
