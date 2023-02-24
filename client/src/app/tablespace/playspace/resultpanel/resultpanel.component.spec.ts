import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ResultpanelComponent } from './resultpanel.component';

describe('ResultpanelComponent', () => {
  let component: ResultpanelComponent;
  let fixture: ComponentFixture<ResultpanelComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ResultpanelComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ResultpanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
