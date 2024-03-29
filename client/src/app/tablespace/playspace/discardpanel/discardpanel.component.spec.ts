import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { DiscardpanelComponent } from './discardpanel.component';

describe('DiscardpanelComponent', () => {
  let component: DiscardpanelComponent;
  let fixture: ComponentFixture<DiscardpanelComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ DiscardpanelComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DiscardpanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
