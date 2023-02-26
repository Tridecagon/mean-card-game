import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { BidpanelComponent } from './bidpanel.component';

describe('BidpanelComponent', () => {
  let component: BidpanelComponent;
  let fixture: ComponentFixture<BidpanelComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ BidpanelComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BidpanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
